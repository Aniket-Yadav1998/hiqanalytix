from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import secrets
import asyncio
import time
import math
from html import escape as html_escape
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Dict, Tuple
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
INSIGHTS_ADMIN_TOKEN = os.environ.get("INSIGHTS_ADMIN_TOKEN", "").strip()
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    logger.info("Resend configured (sender=%s, sales=%s)", SENDER_EMAIL, SALES_EMAIL or "<unset>")
else:
    logger.info("RESEND_API_KEY not set — lead email notifications disabled")

# ---------- Rate Limit Configuration ----------
# All thresholds configurable via environment variables
def _parse_rate_limit_config(prefix: str, defaults: Dict[str, int]) -> Dict[str, int]:
    """Parse rate limit config from env vars with fallback to defaults."""
    result = {}
    for key, default in defaults.items():
        env_key = f"RATE_LIMIT_{prefix}_{key.upper()}"
        try:
            result[key] = int(os.environ.get(env_key, default))
        except ValueError:
            logger.warning("Invalid %s value, using default: %d", env_key, default)
            result[key] = default
    return result

# Auth routes (strictest) - per IP + per account with exponential backoff
_AUTH_RATE_DEFAULTS = {
    "ip_window_seconds": 900,      # 15 min
    "ip_max_requests": 5,          # 5 attempts per 15 min per IP
    "account_window_seconds": 900,  # 15 min
    "account_max_requests": 3,      # 3 attempts per 15 min per account
    "backoff_base_seconds": 60,     # base backoff
    "backoff_max_seconds": 3600,    # max 1 hour
}
AUTH_RATE_LIMIT = _parse_rate_limit_config("AUTH", _AUTH_RATE_DEFAULTS)

# Public endpoints (contact, roi, newsletter) - moderate
_PUBLIC_RATE_DEFAULTS = {
    "contact": {"window_seconds": 300, "max_requests": 3},      # 3 per 5 min
    "roi": {"window_seconds": 900, "max_requests": 5},          # 5 per 15 min
    "newsletter": {"window_seconds": 900, "max_requests": 5},   # 5 per 15 min
    "insights_get": {"window_seconds": 60, "max_requests": 30}, # 30 per min
    "insights_post": {"window_seconds": 3600, "max_requests": 10}, # 10 per hour
}
PUBLIC_RATE_LIMITS = {}
for endpoint, defaults in _PUBLIC_RATE_DEFAULTS.items():
    PUBLIC_RATE_LIMITS[endpoint] = _parse_rate_limit_config(f"PUBLIC_{endpoint.upper()}", defaults)

# Authenticated user actions (future) - looser
_AUTHED_RATE_DEFAULTS = {
    "window_seconds": 60,
    "max_requests": 60,
}
AUTHED_RATE_LIMIT = _parse_rate_limit_config("AUTHED", _AUTHED_RATE_DEFAULTS)

# Global DoS guard
_GLOBAL_RATE_DEFAULTS = {
    "window_seconds": 900,
    "max_requests": 100,
}
GLOBAL_RATE_LIMIT = _parse_rate_limit_config("GLOBAL", _GLOBAL_RATE_DEFAULTS)

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


class RateLimitStore:
    """Thread-safe in-memory rate limit store with TTL cleanup."""
    
    def __init__(self):
        self._buckets: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()
    
    async def check_and_record(self, key: str, window_seconds: int, max_requests: int) -> Tuple[bool, int]:
        """Check if request is allowed, record if so. Returns (allowed, retry_after_seconds)."""
        async with self._lock:
            now = time.monotonic()
            bucket = self._buckets.get(key, [])
            recent = [stamp for stamp in bucket if now - stamp < window_seconds]
            
            if len(recent) >= max_requests:
                oldest = min(recent) if recent else now
                retry_after = max(1, int(oldest + window_seconds - now))
                return False, retry_after
            
            recent.append(now)
            self._buckets[key] = recent
            return True, 0
    
    async def get_attempt_count(self, key: str, window_seconds: int) -> int:
        """Get current attempt count for a key within window."""
        async with self._lock:
            now = time.monotonic()
            bucket = self._buckets.get(key, [])
            recent = [stamp for stamp in bucket if now - stamp < window_seconds]
            return len(recent)
    
    async def cleanup(self, max_age_seconds: int = 3600):
        """Remove buckets older than max_age_seconds."""
        async with self._lock:
            now = time.monotonic()
            self._buckets = {
                k: [s for s in v if now - s < max_age_seconds]
                for k, v in self._buckets.items()
                if any(now - s < max_age_seconds for s in v)
            }


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Global DoS guard: configurable requests per window per IP."""

    def __init__(self, app, window_seconds: int, max_requests: int, store: RateLimitStore = None):
        super().__init__(app)
        self.window_seconds = window_seconds
        self.max_requests = max_requests
        self._store = store or RateLimitStore()

    async def dispatch(self, request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        allowed, retry_after = await self._store.check_and_record(
            f"global:{client_ip}", self.window_seconds, self.max_requests
        )
        if not allowed:
            from starlette.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(retry_after)}
            )
        return await call_next(request)


def _calculate_backoff(attempt: int, base_seconds: int, max_seconds: int) -> int:
    """Calculate exponential backoff with jitter."""
    backoff = min(base_seconds * (2 ** (attempt - 1)), max_seconds)
    jitter = backoff * 0.1 * (2 * (time.monotonic() % 1) - 1)  # ±10% jitter
    return max(1, int(backoff + jitter))


async def enforce_rate_limit(
    store: RateLimitStore,
    key: str,
    window_seconds: int,
    max_requests: int,
    account_key: Optional[str] = None,
    account_window_seconds: Optional[int] = None,
    account_max_requests: Optional[int] = None,
    backoff_base_seconds: Optional[int] = None,
    backoff_max_seconds: Optional[int] = None,
) -> Tuple[bool, int]:
    """
    Enforce rate limit with optional per-account limits and exponential backoff.
    Returns (allowed, retry_after_seconds).
    """
    # Check IP-based limit
    allowed, retry_after = await store.check_and_record(key, window_seconds, max_requests)
    if not allowed:
        return False, retry_after
    
    # Check account-based limit if provided
    if account_key and account_window_seconds and account_max_requests:
        account_allowed, account_retry = await store.check_and_record(
            f"account:{account_key}", account_window_seconds, account_max_requests
        )
        if not account_allowed:
            # Calculate exponential backoff based on attempt count
            attempt = await store.get_attempt_count(f"account:{account_key}", account_window_seconds)
            if backoff_base_seconds and backoff_max_seconds:
                retry_after = _calculate_backoff(attempt, backoff_base_seconds, backoff_max_seconds)
            return False, max(retry_after, account_retry)
    
    return True, 0


app.add_middleware(SecurityHeadersMiddleware)
# Global DoS guard: configurable requests per window per IP across all routes.
_global_rate_limit_store = RateLimitStore()
app.add_middleware(RateLimitMiddleware, window_seconds=GLOBAL_RATE_LIMIT["window_seconds"], max_requests=GLOBAL_RATE_LIMIT["max_requests"], store=_global_rate_limit_store)

# Per-route rate limit stores
_contact_rate_limit = RateLimitStore()
_roi_rate_limit = RateLimitStore()
_newsletter_rate_limit = RateLimitStore()
_insights_get_rate_limit = RateLimitStore()
_insights_post_rate_limit = RateLimitStore()
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

# XSS/Injection prevention patterns
_HTML_TAG_PATTERN = re.compile(r"<[^>]*>")
_SCRIPT_PATTERN = re.compile(r"<script[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
_SQL_INJECTION_PATTERN = re.compile(r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\b.*\b(FROM|WHERE|TABLE)\b)", re.IGNORECASE)


def _sanitize_text(v: str, max_length: int, field_name: str) -> str:
    """Sanitize text input: strip, validate length, reject HTML/scripts/SQL."""
    v = v.strip()
    if not v:
        raise ValueError(f"{field_name} must not be blank")
    if len(v) > max_length:
        raise ValueError(f"{field_name} exceeds maximum length of {max_length}")
    if _HTML_TAG_PATTERN.search(v):
        raise ValueError(f"{field_name} must not contain HTML tags")
    if _SCRIPT_PATTERN.search(v):
        raise ValueError(f"{field_name} must not contain scripts")
    if _SQL_INJECTION_PATTERN.search(v):
        raise ValueError(f"{field_name} contains invalid characters")
    return v


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

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = _sanitize_text(v, 120, "name")
        if not re.fullmatch(r"[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ .'\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*", v, re.UNICODE):
            raise ValueError("name may contain letters, spaces, apostrophes, and hyphens only")
        return v

    @field_validator("company")
    @classmethod
    def validate_company(cls, v: str) -> str:
        return _sanitize_text(v, 160, "company")

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        return _sanitize_text(v, 500, "message")

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

    @field_validator("website")
    @classmethod
    def validate_website(cls, v: str) -> str:
        # Honeypot field - must be empty
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

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = _sanitize_text(v, 120, "name")
        if not re.fullmatch(r"[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ .'\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*", v, re.UNICODE):
            raise ValueError("name may contain letters, spaces, apostrophes, and hyphens only")
        return v

    @field_validator("company")
    @classmethod
    def validate_company(cls, v: str) -> str:
        return _sanitize_text(v, 160, "company")

    @field_validator("industry")
    @classmethod
    def validate_industry(cls, v: str) -> str:
        allowed = {"Financial", "Automotive", "Engineering", "Energy", "Health", "Other"}
        v = _sanitize_text(v, 40, "industry")
        if v not in allowed:
            raise ValueError("invalid industry")
        return v

    @field_validator("current_tools")
    @classmethod
    def validate_current_tools(cls, v: str) -> str:
        return _sanitize_text(v, 400, "current_tools")

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

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        return _sanitize_text(v, 200, "title")

    @field_validator("excerpt")
    @classmethod
    def validate_excerpt(cls, v: str) -> str:
        return _sanitize_text(v, 800, "excerpt")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        return _sanitize_text(v, 60, "category")

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, v: str) -> str:
        v = v.strip()
        if v and not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("image_url must be a valid HTTP/HTTPS URL")
        if len(v) > 500:
            raise ValueError("image_url exceeds maximum length of 500")
        return v


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
    cfg = PUBLIC_RATE_LIMITS["contact"]
    allowed, retry_after = await enforce_rate_limit(
        _contact_rate_limit,
        f"contact:ip:{client_ip}",
        cfg["window_seconds"],
        cfg["max_requests"],
        account_key=payload.email.lower(),
        account_window_seconds=cfg["window_seconds"],
        account_max_requests=cfg["max_requests"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many submissions from this email. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )

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
    cfg = PUBLIC_RATE_LIMITS["roi"]
    allowed, retry_after = await enforce_rate_limit(
        _roi_rate_limit,
        f"roi:ip:{client_ip}",
        cfg["window_seconds"],
        cfg["max_requests"],
        account_key=payload.email.lower(),
        account_window_seconds=cfg["window_seconds"],
        account_max_requests=cfg["max_requests"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many estimates from this email. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
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
    cfg = PUBLIC_RATE_LIMITS["newsletter"]
    allowed, retry_after = await enforce_rate_limit(
        _newsletter_rate_limit,
        f"newsletter:ip:{client_ip}",
        cfg["window_seconds"],
        cfg["max_requests"],
        account_key=payload.email.lower(),
        account_window_seconds=cfg["window_seconds"],
        account_max_requests=cfg["max_requests"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many subscription attempts from this email. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
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
async def list_insights(limit: int = 12, request: Request = None):
    client_ip = request.client.host if request and request.client else "unknown"
    cfg = PUBLIC_RATE_LIMITS["insights_get"]
    allowed, retry_after = await enforce_rate_limit(
        _insights_get_rate_limit,
        f"insights:get:ip:{client_ip}",
        cfg["window_seconds"],
        cfg["max_requests"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
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
async def create_insight(payload: InsightCreate, request: Request):
    """Admin endpoint to create insight posts. Rate limited strictly."""
    admin_token = request.headers.get("X-Admin-Token", "")
    if not INSIGHTS_ADMIN_TOKEN:
        logger.error("INSIGHTS_ADMIN_TOKEN is not configured; insight publishing is unavailable")
        raise HTTPException(status_code=503, detail="Insight publishing is temporarily unavailable.")
    if not secrets.compare_digest(admin_token, INSIGHTS_ADMIN_TOKEN):
        raise HTTPException(
            status_code=401,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    client_ip = request.client.host if request.client else "unknown"
    cfg = PUBLIC_RATE_LIMITS["insights_post"]
    allowed, retry_after = await enforce_rate_limit(
        _insights_post_rate_limit,
        f"insights:post:ip:{client_ip}",
        cfg["window_seconds"],
        cfg["max_requests"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
    post = InsightPost(**payload.model_dump())
    doc = post.model_dump()
    doc["published_at"] = doc["published_at"].isoformat()
    try:
        await db.insights.insert_one(doc)
    except Exception:
        logger.exception("Failed to persist insight post")
        raise HTTPException(status_code=500, detail="Failed to create post.")
    logger.info("New insight post created: %s", post.title)
    return post


# ---------- Auth Endpoints (Placeholder - Future Implementation) ----------
# These endpoints demonstrate the strict rate limiting pattern for authentication routes
# They are not currently wired to any authentication system.

class AuthLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        email = str(v).strip().lower()
        if not _EMAIL_PATTERN.fullmatch(email):
            raise ValueError("invalid email format")
        return email


class AuthRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=2, max_length=120)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        email = str(v).strip().lower()
        if not _EMAIL_PATTERN.fullmatch(email):
            raise ValueError("invalid email format")
        return email

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        return _sanitize_text(v, 120, "name")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        # Enforce password complexity
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("password must contain at least one digit")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", v):
            raise ValueError("password must contain at least one special character")
        return v


class AuthForgotPassword(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: EmailStr) -> str:
        email = str(v).strip().lower()
        if not _EMAIL_PATTERN.fullmatch(email):
            raise ValueError("invalid email format")
        return email


class AuthResetPassword(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("token")
    @classmethod
    def validate_token(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("token is required")
        if len(v) > 256:
            raise ValueError("invalid token")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("password must contain at least one digit")
        if not re.search(r"[!@#$$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", v):
            raise ValueError("password must contain at least one special character")
        return v


@api_router.post("/auth/login")
async def auth_login(payload: AuthLogin, request: Request):
    """Login endpoint with strict per-IP and per-account rate limiting with exponential backoff."""
    client_ip = request.client.host if request.client else "unknown"
    email_key = payload.email.lower()
    allowed, retry_after = await enforce_rate_limit(
        _contact_rate_limit,  # Reuse store
        f"auth:login:ip:{client_ip}",
        AUTH_RATE_LIMIT["ip_window_seconds"],
        AUTH_RATE_LIMIT["ip_max_requests"],
        account_key=email_key,
        account_window_seconds=AUTH_RATE_LIMIT["account_window_seconds"],
        account_max_requests=AUTH_RATE_LIMIT["account_max_requests"],
        backoff_base_seconds=AUTH_RATE_LIMIT["backoff_base_seconds"],
        backoff_max_seconds=AUTH_RATE_LIMIT["backoff_max_seconds"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many login attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
    # TODO: Implement actual authentication
    raise HTTPException(status_code=501, detail="Authentication not yet implemented")


@api_router.post("/auth/register")
async def auth_register(payload: AuthRegister, request: Request):
    """Registration endpoint with strict per-IP and per-account rate limiting with exponential backoff."""
    client_ip = request.client.host if request.client else "unknown"
    email_key = payload.email.lower()
    allowed, retry_after = await enforce_rate_limit(
        _contact_rate_limit,  # Reuse store
        f"auth:register:ip:{client_ip}",
        AUTH_RATE_LIMIT["ip_window_seconds"],
        AUTH_RATE_LIMIT["ip_max_requests"],
        account_key=email_key,
        account_window_seconds=AUTH_RATE_LIMIT["account_window_seconds"],
        account_max_requests=AUTH_RATE_LIMIT["account_max_requests"],
        backoff_base_seconds=AUTH_RATE_LIMIT["backoff_base_seconds"],
        backoff_max_seconds=AUTH_RATE_LIMIT["backoff_max_seconds"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many registration attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
    # TODO: Implement actual registration
    raise HTTPException(status_code=501, detail="Authentication not yet implemented")


@api_router.post("/auth/forgot-password")
async def auth_forgot_password(payload: AuthForgotPassword, request: Request):
    """Password reset request with strict per-IP and per-account rate limiting."""
    client_ip = request.client.host if request.client else "unknown"
    email_key = payload.email.lower()
    allowed, retry_after = await enforce_rate_limit(
        _contact_rate_limit,  # Reuse store
        f"auth:forgot:ip:{client_ip}",
        AUTH_RATE_LIMIT["ip_window_seconds"],
        AUTH_RATE_LIMIT["ip_max_requests"],
        account_key=email_key,
        account_window_seconds=AUTH_RATE_LIMIT["account_window_seconds"],
        account_max_requests=AUTH_RATE_LIMIT["account_max_requests"],
        backoff_base_seconds=AUTH_RATE_LIMIT["backoff_base_seconds"],
        backoff_max_seconds=AUTH_RATE_LIMIT["backoff_max_seconds"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many password reset requests. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
    # TODO: Implement actual password reset request
    raise HTTPException(status_code=501, detail="Authentication not yet implemented")


@api_router.post("/auth/reset-password")
async def auth_reset_password(payload: AuthResetPassword, request: Request):
    """Password reset confirmation with strict rate limiting."""
    client_ip = request.client.host if request.client else "unknown"
    allowed, retry_after = await enforce_rate_limit(
        _contact_rate_limit,  # Reuse store
        f"auth:reset:ip:{client_ip}",
        AUTH_RATE_LIMIT["ip_window_seconds"],
        AUTH_RATE_LIMIT["ip_max_requests"],
        backoff_base_seconds=AUTH_RATE_LIMIT["backoff_base_seconds"],
        backoff_max_seconds=AUTH_RATE_LIMIT["backoff_max_seconds"],
    )
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)}
        )
    # TODO: Implement actual password reset
    raise HTTPException(status_code=501, detail="Authentication not yet implemented")


# ---------- Global Exception Handlers (Prevent Information Leakage) ----------
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle FastAPI request validation errors - return specific field errors."""
    logger.warning("Request validation error on %s %s: %s", request.method, request.url.path, exc.errors())
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"][1:])  # Skip 'body'
        errors.append(f"{field}: {error['msg']}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors}
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors - return specific field errors."""
    logger.warning("Validation error on %s %s: %s", request.method, request.url.path, exc.errors())
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append(f"{field}: {error['msg']}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Ensure HTTP exceptions don't leak internal details."""
    # Log the actual error for debugging
    if exc.status_code >= 500:
        logger.exception("Server error on %s %s: %s", request.method, request.url.path, exc.detail)
    else:
        logger.warning("Client error on %s %s: %s", request.method, request.url.path, exc.detail)
    
    # Return generic message for 5xx errors
    if exc.status_code >= 500:
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": "An internal error occurred. Please try again later."},
            headers=exc.headers
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all handler - never leak stack traces or internal details."""
    logger.exception("Unhandled exception on %s %s: %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )


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
    
    # Start periodic cleanup for rate limit stores
    async def cleanup_rate_limits():
        while True:
            await asyncio.sleep(300)  # Run every 5 minutes
            try:
                await _contact_rate_limit.cleanup()
                await _roi_rate_limit.cleanup()
                await _newsletter_rate_limit.cleanup()
                await _insights_get_rate_limit.cleanup()
                await _insights_post_rate_limit.cleanup()
                await _global_rate_limit_store.cleanup()
            except Exception:
                logger.exception("Rate limit cleanup failed")
    
    asyncio.create_task(cleanup_rate_limits())


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
