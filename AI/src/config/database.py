"""
PostgreSQL Database Configuration for UMX Backend
Uses SQLAlchemy ORM with PostgreSQL
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://umx_admin:umx_password_2025@localhost:5432/umx_db"
)

# Create SQLAlchemy engine for PostgreSQL
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,        # Connection pool size
    max_overflow=20,     # Max overflow connections
    echo=True if os.getenv("DEBUG", "True") == "True" else False  # Log SQL queries in debug mode
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create Base class for declarative models
Base = declarative_base()


# Dependency function for FastAPI
def get_db():
    """
    Database session dependency for FastAPI endpoints.
    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Helper function to initialize database
def init_db():
    """
    Initialize database tables based on SQLAlchemy models.
    
    Important: Import all models before calling this function
    so that Base.metadata contains all table definitions.
    """
    try:
        # Import all models here to ensure they are registered with Base.metadata
        # Uncomment when you create these model files
        # from src.models import user, student, domain, goal, report, parent
        pass
    except ImportError as e:
        print(f"Warning: Could not import models: {e}")
        print("Create model files first before initializing database.")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


# Helper function to drop all tables (use with caution!)
def drop_db():
    """
    Drop all database tables.
    
    WARNING: This will delete all data! Use only in development.
    """
    Base.metadata.drop_all(bind=engine)
    print("⚠️  All database tables dropped!")


# Test database connection
def test_connection():
    """
    Test PostgreSQL database connection.
    
    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()
        print(f"✅ PostgreSQL connection successful!")
        print(f"📊 Database: {engine.url.database}")
        print(f"🌐 Host: {engine.url.host}:{engine.url.port}")
        print(f"👤 User: {engine.url.username}")
        return True
    except Exception as e:
        print(f"❌ Database connection failed!")
        print(f"Error: {str(e)}")
        print(f"\n💡 Make sure PostgreSQL is running and credentials are correct in .env file")
        return False


if __name__ == "__main__":
    # Test connection when running this file directly
    print("Testing PostgreSQL connection...")
    test_connection()