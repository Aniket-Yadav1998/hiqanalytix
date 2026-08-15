from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="hiqanalytix API")

# Create a router with the /api prefix
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


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "hiqanalytix API is running", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "service": "hiqanalytix-api"}


@api_router.post("/contact", response_model=Contact, status_code=201)
async def create_contact(payload: ContactCreate):
    contact = Contact(**payload.model_dump())
    doc = contact.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    try:
        await db.contacts.insert_one(doc)
    except Exception as e:
        logger.exception("Failed to persist contact lead")
        raise HTTPException(status_code=500, detail="Failed to submit message. Please try again later.")
    logger.info("New contact lead saved: %s <%s>", contact.name, contact.email)
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


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
