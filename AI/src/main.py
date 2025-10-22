import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.config import settings
from config.database import engine, Base, init_db

# Import models to register with Base.metadata
from models.user import User

# Create tables
init_db()

app = FastAPI(
    title="UMX API",
    description="Student Intervention Management System",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from routers.auth import router as auth_router
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {
        "message": "UMX API",
        "version": settings.API_VERSION,
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "debug": settings.DEBUG}
