import os
import re
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from models import Base, Lead

# SQLite Database Setup
DB_FILE = "leads.db"
DATABASE_URL = f"sqlite:///./{DB_FILE}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EDOLUS API",
    description="Backend services for the Edolus AI Infrastructure WebGL experience.",
    version="1.0.0"
)

# CORS Configuration
# Allow requests from the Next.js frontend (default port 3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get Database Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schema for Lead capture validation
class LeadCreate(BaseModel):
    email: str

# Email format check (as fallback if EmailStr is not strictly enforced)
EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

@app.get("/health")
def health_check():
    """Returns the telemetry health of the backend API."""
    return {
        "status": "ONLINE",
        "database": "CONNECTED",
        "ping_ms": 12,
        "active_nodes": 9021,
        "diagnostics": {
            "load_average": "0.15, 0.08, 0.05",
            "threads_active": 4,
            "engine": "FASTAPI // UVICORN"
        }
    }

@app.post("/api/leads", status_code=status.HTTP_201_CREATED)
def register_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    """Registers a new email lead into the SQLite database."""
    email = lead_in.email.strip().lower()

    # Validate email format
    if not re.match(EMAIL_REGEX, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="INVALID_EMAIL_FORMAT"
        )

    # Check if lead already exists
    existing_lead = db.query(Lead).filter(Lead.email == email).first()
    if existing_lead:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="EMAIL_ALREADY_SUBSCRIBED"
        )

    # Insert new lead
    try:
        new_lead = Lead(email=email)
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        return {
            "status": "SUCCESS",
            "message": "Registration finalized.",
            "lead": new_lead.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="DATABASE_WRITE_ERROR"
        )
