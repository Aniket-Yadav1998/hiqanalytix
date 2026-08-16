from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import asyncio
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

app = FastAPI(title="hiqanalytix API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(..., min_length=6, max_length=32)
    company: str = Field(..., min_length=2, max_length=160)
    message: str = Field(..., min_length=10, max_length=4000)

    @field_validator("name", "company", "message")
    @classmethod
    def strip_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be blank")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[\d\s+()\-]{6,32}$", v):
            raise ValueError("invalid phone")
        return v


class Contact(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
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
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InsightCreate(BaseModel):
    title: str = Field(..., min_length=6, max_length=200)
    excerpt: str = Field(..., min_length=20, max_length=800)
    category: str = Field(..., min_length=2, max_length=60)
    read_minutes: int = Field(default=6, ge=1, le=60)


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
    return f"""
    <div style="font-family: Arial, Helvetica, sans-serif; color:#0B0B0F; max-width:640px; margin:auto;">
      <h2 style="color:#F97316; margin:0 0 16px;">New contact lead — hiqanalytix.com</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%; border:1px solid #E5E5E5;">
        <tr><td style="background:#FAFAFA; font-weight:bold; width:150px;">Name</td><td>{c.name}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Email</td><td>{c.email}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Phone</td><td>{c.phone}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Company</td><td>{c.company}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold; vertical-align:top;">Message</td><td style="white-space:pre-wrap;">{c.message}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Received</td><td>{c.created_at.isoformat()}</td></tr>
      </table>
      <p style="color:#666; font-size:12px; margin-top:16px;">Auto-generated from the contact form on hiqanalytix.com</p>
    </div>
    """


def _roi_email_html(r: "RoiLead") -> str:
    return f"""
    <div style="font-family: Arial, Helvetica, sans-serif; color:#0B0B0F; max-width:640px; margin:auto;">
      <h2 style="color:#F97316; margin:0 0 8px;">New ROI calculator lead — hiqanalytix.com</h2>
      <p style="margin:0 0 20px; color:#333;">Industry: <b>{r.industry}</b> · Company: <b>{r.company}</b></p>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%; border:1px solid #E5E5E5;">
        <tr><td style="background:#FAFAFA; font-weight:bold; width:220px;">Name</td><td>{r.name}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Email</td><td>{r.email}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Company</td><td>{r.company}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Industry</td><td>{r.industry}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Current manpower</td><td>{r.current_manpower} people</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Current hours / week</td><td>{r.current_hours_per_week}</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Tools today</td><td>{r.current_tools}</td></tr>
        <tr><td style="background:#FFF7ED; font-weight:bold; color:#C2410C;">Projected saving</td>
            <td><b>{r.money_savings_pct}%</b> cost · <b>{r.manpower_reduction_pct}%</b> less manpower · <b>{r.time_reduction_pct}%</b> faster</td></tr>
        <tr><td style="background:#FFF7ED; font-weight:bold; color:#C2410C;">Projected steady-state</td>
            <td>{r.projected_manpower} people · {r.projected_hours_per_week} hrs/wk</td></tr>
        <tr><td style="background:#FAFAFA; font-weight:bold;">Received</td><td>{r.created_at.isoformat()}</td></tr>
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
async def create_contact(payload: ContactCreate, background_tasks: BackgroundTasks):
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


@api_router.get("/contact", response_model=List[Contact])
async def list_contacts(limit: int = 100):
    limit = max(1, min(limit, 500))
    items = await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for item in items:
        if isinstance(item.get("created_at"), str):
            try:
                item["created_at"] = datetime.fromisoformat(item["created_at"])
            except ValueError:
                pass
    return items


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
async def create_roi_estimate(payload: RoiCreate, background_tasks: BackgroundTasks):
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


@api_router.get("/roi-estimate", response_model=List[RoiLead])
async def list_roi_estimates(limit: int = 100):
    limit = max(1, min(limit, 500))
    items = await db.roi_leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for item in items:
        if isinstance(item.get("created_at"), str):
            try:
                item["created_at"] = datetime.fromisoformat(item["created_at"])
            except ValueError:
                pass
    return items


# ---------- Insights ----------
_SEED_INSIGHTS = [
    {
        "title": "Why every Power BI programme fails at year 2 — and how to prevent it",
        "excerpt": "Governance debt, dataset sprawl and no adoption metrics. The three quiet killers of enterprise BI programmes and the levers that fix them.",
        "category": "Power BI",
        "read_minutes": 6,
    },
    {
        "title": "RPA vs Power Automate vs Copilot Studio — the 2026 decision tree",
        "excerpt": "A pragmatic decision framework we use with clients to pick the right automation tool for each of the 40+ processes we typically inventory in week one.",
        "category": "Automation",
        "read_minutes": 8,
    },
    {
        "title": "OEE dashboards that plant managers actually use",
        "excerpt": "Six design principles behind the automotive OEE dashboards we deploy — and the anti-patterns that quietly kill adoption on the shop floor.",
        "category": "Automotive",
        "read_minutes": 5,
    },
    {
        "title": "Closing the books in 2.5 days: a Power BI + Power Automate blueprint",
        "excerpt": "How we compressed a mid-market bank's monthly close from 9 days to 2.5, moving 42 Excel workbooks into a single governed pipeline.",
        "category": "Financial",
        "read_minutes": 7,
    },
    {
        "title": "Renewables asset performance: from post-mortem reports to live triage",
        "excerpt": "The four telemetry patterns that let a European IPP replace weekly PDFs with a Fabric-backed live triage cockpit — and cut ticket handling by 55%.",
        "category": "Energy",
        "read_minutes": 6,
    },
    {
        "title": "HIPAA-aware analytics: the 5 controls we bake in on day one",
        "excerpt": "Row-level security, audit lineage, tokenised PHI, provisioned workspaces and evidence packs — how we make healthcare BI defensible without slowing delivery.",
        "category": "Health",
        "read_minutes": 5,
    },
]


async def _ensure_insights_seed():
    if await db.insights.count_documents({}) > 0:
        return
    now = datetime.now(timezone.utc).timestamp()
    docs = []
    for i, s in enumerate(_SEED_INSIGHTS):
        post = InsightPost(**s)
        d = post.model_dump()
        # Stagger published_at ~30 days apart so the newest is on top.
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


@api_router.post("/insights", response_model=InsightPost, status_code=201)
async def create_insight(payload: InsightCreate):
    post = InsightPost(**payload.model_dump())
    doc = post.model_dump()
    doc["published_at"] = doc["published_at"].isoformat()
    try:
        await db.insights.insert_one(doc)
    except Exception:
        logger.exception("Failed to persist insight")
        raise HTTPException(status_code=500, detail="Failed to publish. Please try again.")
    return post


# ---------- Lifecycle ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
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
