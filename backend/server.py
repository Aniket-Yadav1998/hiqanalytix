from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import asyncio
import time
from html import escape as html_escape
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone

import resend


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend (optional — best-effort notifications)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev").strip()
SALES_EMAIL = os.environ.get("SALES_EMAIL", "").strip()
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend configured (sender=%s, sales=%s)", SENDER_EMAIL, SALES_EMAIL or "<unset>")
else:
    logger.info("RESEND_API_KEY not set — lead email notifications disabled")

_ENABLE_API_DOCS = os.environ.get("ENABLE_API_DOCS", "false").lower() == "true"
app = FastAPI(
    title="hiqanalytix API",
    docs_url="/docs" if _ENABLE_API_DOCS else None,
    redoc_url="/redoc" if _ENABLE_API_DOCS else None,
    openapi_url="/openapi.json" if _ENABLE_API_DOCS else None,
)
api_router = APIRouter(prefix="/api")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data: https://images.unsplash.com https://hiqanalytix.com; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "font-src 'self' data:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'"
        )
        response.headers["Cache-Control"] = "no-store" if request.url.path.startswith("/api") else response.headers.get("Cache-Control", "public, max-age=3600")
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Global, in-memory, per-IP request throttle (single-process; resets on restart)."""

    def __init__(self, app, window_seconds: int, max_requests: int):
        super().__init__(app)
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self._buckets = {}

    async def dispatch(self, request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()
        recent = [stamp for stamp in self._buckets.get(client_ip, []) if now - stamp < self.window_seconds]
        if len(recent) >= self.max_requests:
            from starlette.responses import JSONResponse
            return JSONResponse(status_code=429, content={"detail": "Too many requests. Please try again later."})
        recent.append(now)
        self._buckets[client_ip] = recent
        return await call_next(request)


def _enforce_rate_limit(buckets: dict, client_ip: str, window_seconds: int, max_requests: int):
    now = time.monotonic()
    recent = [stamp for stamp in buckets.get(client_ip, []) if now - stamp < window_seconds]
    if len(recent) >= max_requests:
        raise HTTPException(status_code=429, detail="Too many submissions. Please try again later.")
    recent.append(now)
    buckets[client_ip] = recent


app.add_middleware(SecurityHeadersMiddleware)
# Global DoS guard: 100 requests / 15 minutes per IP across all routes.
app.add_middleware(RateLimitMiddleware, window_seconds=900, max_requests=100)
_contact_rate_limit = {}
_CONTACT_WINDOW_SECONDS = 300
_CONTACT_MAX_REQUESTS = 3
# Stricter per-route limits for lead-generating / heavier endpoints: 5 requests / 15 minutes per IP.
_roi_rate_limit = {}
_newsletter_rate_limit = {}
_STRICT_WINDOW_SECONDS = 900
_STRICT_MAX_REQUESTS = 5
_MOBILE_DIGITS = {
    "IN": {10}, "US": {10}, "CA": {10}, "GB": {10}, "DE": {10, 11},
    "FR": {9}, "IT": {9, 10}, "ES": {9}, "NL": {9}, "BE": {9},
    "CH": {9}, "AT": {10, 11}, "SE": {9}, "NO": {8}, "DK": {8},
    "FI": {9, 10}, "IE": {9}, "PT": {9}, "PL": {9}, "CZ": {9},
    "AU": {9}, "NZ": {8, 9}, "JP": {9, 10}, "SG": {8}, "AE": {9},
    "SA": {9}, "ZA": {9},
}
_COUNTRY_DIALS = {
    "IN": "91", "US": "1", "CA": "1", "GB": "44", "DE": "49", "FR": "33",
    "IT": "39", "ES": "34", "NL": "31", "BE": "32", "CH": "41", "AT": "43",
    "SE": "46", "NO": "47", "DK": "45", "FI": "358", "IE": "353", "PT": "351",
    "PL": "48", "CZ": "420", "AU": "61", "NZ": "64", "JP": "81", "SG": "65",
    "AE": "971", "SA": "966", "ZA": "27",
}
_EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@"
    r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
)


# ---------- Models ----------
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    country: Optional[str] = None
    phone: str = Field(..., min_length=6, max_length=32)
    telephone: Optional[str] = Field(default=None, max_length=32)
    company: str = Field(..., min_length=2, max_length=160)
    message: str = Field(..., min_length=10, max_length=500)
    website: str = Field(default="", max_length=200)
    form_started_at: Optional[int] = None
    human_confirmed: bool = False

    @field_validator("name", "company", "message")
    @classmethod
    def strip_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        email = str(v).strip()
        email_parts = email.split("@", 1)
        local_part = email_parts[0] if email_parts else ""
        domain_parts = email_parts[1].split(".") if len(email_parts) == 2 else []
        if (
            len(email) > 254
            or not _EMAIL_PATTERN.fullmatch(email)
            or ".." in email
            or local_part.startswith(".")
            or local_part.endswith(".")
            or any(len(part) < 1 for part in domain_parts)
        ):
            raise ValueError("enter a valid business email address")
        return email.lower()

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not re.fullmatch(r"[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ .'\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*", v, re.UNICODE):
            raise ValueError("name may contain letters, spaces, apostrophes, and hyphens only")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[\d\s+()\-]{6,32}$", v) or len(re.sub(r"\D", "", v)) < 7:
            raise ValueError("invalid phone")
        return v

    @field_validator("telephone")
    @classmethod
    def validate_telephone(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        v = v.strip()
        if not re.match(r"^[\d\s+()\-]{6,32}$", v):
            raise ValueError("invalid telephone")
        return v


class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    telephone: Optional[str] = None
    company: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RoiCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    company: str = Field(..., min_length=2, max_length=160)
    industry: str = Field(..., min_length=2, max_length=40)
    current_manpower: int = Field(..., ge=1, le=100000)
    current_hours_per_week: int = Field(..., ge=1, le=10000)
    current_tools: str = Field(..., min_length=2, max_length=400)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        email = str(v).strip()
        email_parts = email.split("@", 1)
        local_part = email_parts[0] if email_parts else ""
        domain_parts = email_parts[1].split(".") if len(email_parts) == 2 else []
        if (
            len(email) > 254
            or not _EMAIL_PATTERN.fullmatch(email)
            or ".." in email
            or local_part.startswith(".")
            or local_part.endswith(".")
            or any(len(part) < 2 for part in domain_parts)
        ):
            raise ValueError("enter a valid business email address")
        return email.lower()


class RoiLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    company: str
    industry: str
    current_manpower: int
    current_hours_per_week: int
    current_tools: str
    money_savings_pct: int
    manpower_reduction_pct: int
    time_reduction_pct: int
    projected_manpower: float
    projected_hours_per_week: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InsightPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    category: str
    read_minutes: int = Field(default=6, ge=1, le=60)
    image_url: str = ""
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InsightCreate(BaseModel):
    title: str = Field(..., min_length=6, max_length=200)
    excerpt: str = Field(..., min_length=20, max_length=800)
    category: str = Field(..., min_length=2, max_length=60)
    read_minutes: int = Field(default=6, ge=1, le=60)
    image_url: str = Field(default="", max_length=500)


class NewsletterCreate(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        email = str(v).strip()
        email_parts = email.split("@", 1)
        local_part = email_parts[0] if email_parts else ""
        domain_parts = email_parts[1].split(".") if len(email_parts) == 2 else []
        if (
            len(email) > 254
            or not _EMAIL_PATTERN.fullmatch(email)
            or ".." in email
            or local_part.startswith(".")
            or local_part.endswith(".")
            or any(len(part) < 1 for part in domain_parts)
        ):
            raise ValueError("enter a valid email address")
        return email.lower()


class NewsletterSubscriber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Email helper (best-effort, non-blocking) ----------
def _send_email_sync(subject: str, html: str):
    """Blocking call — must be run via asyncio.to_thread."""
    if not RESEND_API_KEY or not SALES_EMAIL:
        logger.info("Skipping email: RESEND_API_KEY or SALES_EMAIL not configured")
        return
    try:
        result = resend.Emails.send({
            "from": SENDER_EMAIL,
            "to": [SALES_EMAIL],
            "subject": subject,
            "html": html,
        })
        logger.info("Email sent (id=%s) to %s", result.get("id"), SALES_EMAIL)
    except Exception:
        logger.exception("Resend email failed — swallowing so form request is unaffected")


async def _notify(subject: str, html: str):
    # Fire and forget — never fail the API response if email breaks.
    try:
        await asyncio.to_thread(_send_email_sync, subject, html)
    except Exception:
        logger.exception("Notification wrapper failed silently")


def _contact_email_html(c: "Contact") -> str:
    name = html_escape(c.name)
    email = html_escape(c.email)
    phone = html_escape(c.phone)
    telephone = html_escape(c.telephone or "Not provided")
    company = html_escape(c.company)
    message = html_escape(c.message).replace("\n", "<br>")
    received_at = html_escape(c.created_at.isoformat())
    return f"""
    <div style="font-family: Arial, Helvetica, sans-serif; color:#0B0B0F; max-width:640px; margin:auto;">
      <h2 style="color:#F97316; margin:0 0 16px;">New contact lead — hiqanalytix.com</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%; border:1px solid #E5E5E5;">
        <tr><td style="background:#FAFAFA; font-weight:bold; width:150px;">Name</td><td>{name}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Email</td><td>{email}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Phone</td><td>{phone}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Telephone</td><td>{telephone}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Company</td><td>{company}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold; vertical-align:top;">Message</td><td>{message}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Received</td><td>{received_at}</td></tr>
      </table>
      <p style="color:#666; font-size:12px; margin-top:16px;">Auto-generated from the contact form on hiqanalytix.com</p>
    </div>
    """


def _roi_email_html(r: "RoiLead") -> str:
    name = html_escape(r.name)
    email = html_escape(r.email)
    company = html_escape(r.company)
    industry = html_escape(r.industry)
    current_tools = html_escape(r.current_tools)
    received_at = html_escape(r.created_at.isoformat())
    return f"""
    <div style="font-family: Arial, Helvetica, sans-serif; color:#0B0B0F; max-width:640px; margin:auto;">
      <h2 style="color:#F97316; margin:0 0 8px;">New ROI calculator lead — hiqanalytix.com</h2>
      <p style="margin:0 0 20px; color:#333;">Industry: <b>{industry}</b> · Company: <b>{company}</b></p>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%; border:1px solid #E5E5E5;">
        <tr><td style="background:#FAFAFA; font-weight:bold; width:220px;">Name</td><td>{name}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Email</td><td>{email}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Company</td><td>{company}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Industry</td><td>{industry}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Current manpower</td><td>{r.current_manpower} people</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Current hours / week</td><td>{r.current_hours_per_week}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Tools today</td><td>{current_tools}</td></tr>
        <tr><td style="background:#FFF7ED; font-weight:bold; color:#C2410C;">Projected saving</td>
            <td><b>{r.money_savings_pct}%</b> cost · <b>{r.manpower_reduction_pct}%</b> less manpower · <b>{r.time_reduction_pct}%</b> faster</td></tr>
        <tr><td style="background:#FFF7ED; font-weight:bold; color:#C2410C;">Projected steady-state</td>
            <td>{r.projected_manpower} people · {r.projected_hours_per_week} hrs/wk</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Received</td><td>{received_at}</td></tr>
      </table>
      <p style="color:#666; font-size:12px; margin-top:16px;">Auto-generated from the ROI calculator on hiqanalytix.com</p>
    </div>
    """


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "hiqanalytix API is running", "status": "ok"}


@api_router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "hiqanalytix-api",
        "email_configured": bool(RESEND_API_KEY and SALES_EMAIL),
    }


@api_router.post("/contact", response_model=Contact, status_code=201)
async def create_contact(payload: ContactCreate, background_tasks: BackgroundTasks, request: Request):
    if not payload.human_confirmed:
        raise HTTPException(status_code=400, detail="Please confirm that you are human")
    if payload.country and payload.country in _MOBILE_DIGITS:
        mobile_digits = re.sub(r"\D", "", payload.phone)
        dial = _COUNTRY_DIALS[payload.country]
        if mobile_digits.startswith(dial):
            mobile_digits = mobile_digits[len(dial):]
        if len(mobile_digits) not in _MOBILE_DIGITS[payload.country]:
            raise HTTPException(status_code=422, detail="Enter a valid mobile number for the selected country")
    if payload.website.strip():
        raise HTTPException(status_code=400, detail="Unable to submit this form")
    if payload.form_started_at and int(time.time() * 1000) - payload.form_started_at < 2500:
        raise HTTPException(status_code=400, detail="Please take a moment to review your details")

    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(_contact_rate_limit, client_ip, _CONTACT_WINDOW_SECONDS, _CONTACT_MAX_REQUESTS)

    contact = Contact(**payload.model_dump())
    doc = contact.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    try:
        await db.contacts.insert_one(doc)
    except Exception:
        logger.exception("Failed to persist contact lead")
        raise HTTPException(status_code=500, detail="Failed to submit message. Please try again later.")
    logger.info("New contact lead saved: %s <%s>", contact.name, contact.email)
    background_tasks.add_task(
        asyncio.run,
        _notify(f"New contact lead — {contact.company}", _contact_email_html(contact)),
    )
    return contact


def _compute_roi(manpower: int, hours: int) -> dict:
    money_savings_pct = 35
    manpower_reduction_pct = 55
    time_reduction_pct = 35
    projected_manpower = round(manpower * (1 - manpower_reduction_pct / 100), 2)
    projected_hours = round(hours * (1 - time_reduction_pct / 100), 2)
    return {
        "money_savings_pct": money_savings_pct,
        "manpower_reduction_pct": manpower_reduction_pct,
        "time_reduction_pct": time_reduction_pct,
        "projected_manpower": projected_manpower,
        "projected_hours_per_week": projected_hours,
    }


@api_router.post("/roi-estimate", response_model=RoiLead, status_code=201)
async def create_roi_estimate(payload: RoiCreate, background_tasks: BackgroundTasks, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(_roi_rate_limit, client_ip, _STRICT_WINDOW_SECONDS, _STRICT_MAX_REQUESTS)
    computed = _compute_roi(payload.current_manpower, payload.current_hours_per_week)
    lead = RoiLead(**payload.model_dump(), **computed)
    doc = lead.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    try:
        await db.roi_leads.insert_one(doc)
    except Exception:
        logger.exception("Failed to persist ROI lead")
        raise HTTPException(status_code=500, detail="Failed to save your estimate. Please try again later.")
    logger.info("New ROI lead saved: %s <%s> industry=%s", lead.name, lead.email, lead.industry)
    background_tasks.add_task(
        asyncio.run,
        _notify(f"New ROI lead — {lead.company} ({lead.industry})", _roi_email_html(lead)),
    )
    return lead


@api_router.post("/newsletter", response_model=NewsletterSubscriber, status_code=201)
async def subscribe_newsletter(payload: NewsletterCreate, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    _enforce_rate_limit(_newsletter_rate_limit, client_ip, _STRICT_WINDOW_SECONDS, _STRICT_MAX_REQUESTS)
    existing = await db.newsletter_subscribers.find_one({"email": payload.email})
    if existing:
        existing.pop("_id", None)
        return NewsletterSubscriber(**existing)
    subscriber = NewsletterSubscriber(email=payload.email)
    doc = subscriber.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    try:
        await db.newsletter_subscribers.insert_one(doc)
    except Exception:
        logger.exception("Failed to persist newsletter subscriber")
        raise HTTPException(status_code=500, detail="Failed to subscribe. Please try again later.")
    logger.info("New newsletter subscriber saved: %s", subscriber.email)
    return subscriber


# ---------- Insights ----------
_SEED_INSIGHTS = [
    {
        "title": "Why every Power BI programme fails at year 2 — and how to prevent it",
        "excerpt": "Governance debt, dataset sprawl and no adoption metrics. The three quiet killers of enterprise BI programmes and the levers that fix them.",
        "category": "Power BI",
        "read_minutes": 6,
        "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "RPA vs Power Automate vs Copilot Studio — the 2026 decision tree",
        "excerpt": "A pragmatic decision framework we use with clients to pick the right automation tool for each of the 40+ processes we typically inventory in week one.",
        "category": "Automation",
        "read_minutes": 8,
        "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "OEE dashboards that plant managers actually use",
        "excerpt": "Six design principles behind the automotive OEE dashboards we deploy — and the anti-patterns that quietly kill adoption on the shop floor.",
        "category": "Automotive",
        "read_minutes": 5,
        "image_url": "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Closing the books in 2.5 days: a Power BI + Power Automate blueprint",
        "excerpt": "How we compressed a mid-market bank's monthly close from 9 days to 2.5, moving 42 Excel workbooks into a single governed pipeline.",
        "category": "Financial",
        "read_minutes": 7,
        "image_url": "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Renewables asset performance: from post-mortem reports to live triage",
        "excerpt": "The four telemetry patterns that let a European IPP replace weekly PDFs with a Fabric-backed live triage cockpit — and cut ticket handling by 55%.",
        "category": "Energy",
        "read_minutes": 6,
        "image_url": "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "HIPAA-aware analytics: the 5 controls we bake in on day one",
        "excerpt": "Row-level security, audit lineage, tokenised PHI, provisioned workspaces and evidence packs — how we make healthcare BI defensible without slowing delivery.",
        "category": "Health",
        "read_minutes": 5,
        "image_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Semantic models that survive scale — the 7 patterns we always use",
        "excerpt": "Star schemas alone don't cut it above 500M rows. The performance patterns we standardise on: aggregations, incremental refresh, composite models and more.",
        "category": "Power BI",
        "read_minutes": 9,
        "image_url": "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "The 20-hour rule: how we scope every Power Platform pilot",
        "excerpt": "A repeatable playbook to de-risk your first Power Apps or Power Automate build — 20 hours of scoping saves 200 hours of rework.",
        "category": "Power Platform",
        "read_minutes": 4,
        "image_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "title": "Copilot Studio in the enterprise: what it's ready for (and what it isn't)",
        "excerpt": "A candid, adoption-first review of Copilot Studio across three real client rollouts — where it earns its keep and where it still needs a human co-pilot.",
        "category": "Copilot",
        "read_minutes": 7,
        "image_url": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    },
]


async def _ensure_insights_seed():
    # Reseed if collection is empty OR if existing docs are missing image_url
    count = await db.insights.count_documents({})
    missing = await db.insights.count_documents({"$or": [{"image_url": {"$exists": False}}, {"image_url": ""}]})
    if count > 0 and missing == 0:
        return
    if count > 0:
        # backfill image_url on existing seeded docs
        await db.insights.delete_many({"title": {"$in": [s["title"] for s in _SEED_INSIGHTS]}})
    now = datetime.now(timezone.utc).timestamp()
    docs = []
    for i, s in enumerate(_SEED_INSIGHTS):
        post = InsightPost(**s)
        d = post.model_dump()
        offset_days = i * 30
        d["published_at"] = datetime.fromtimestamp(now - offset_days * 86400, tz=timezone.utc).isoformat()
        docs.append(d)
    await db.insights.insert_many(docs)
    logger.info("Seeded %d insights posts", len(docs))


@api_router.get("/insights", response_model=List[InsightPost])
async def list_insights(limit: int = 12):
    limit = max(1, min(limit, 100))
    items = await db.insights.find({}, {"_id": 0}).sort("published_at", -1).to_list(limit)
    for item in items:
        if isinstance(item.get("published_at"), str):
            try:
                item["published_at"] = datetime.fromisoformat(item["published_at"])
            except ValueError:
                pass
    return items


# ---------- Lifecycle ----------
app.include_router(api_router)

_default_cors_origins = [
    "http://localhost:3000",
    "https://hiqanalytix.com",
    "https://www.hiqanalytix.com",
]
_configured_cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", ",".join(_default_cors_origins)).split(",")
    if origin.strip()
]
if "*" in _configured_cors_origins:
    logger.warning("Ignoring wildcard CORS_ORIGINS because credentialed requests are enabled")
    _configured_cors_origins = _default_cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_configured_cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("startup")
async def on_startup():
    try:
        await _ensure_insights_seed()
    except Exception:
        logger.exception("Insights seed failed (non-fatal)")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
