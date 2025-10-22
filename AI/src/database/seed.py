import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from config.database import SessionLocal, Base, engine
from services.auth_service import AuthService
from schemas.auth import UserCreate
from models.user import User, UserRole

def seed_admin_user():
    """Create default admin user"""
    # Create tables first
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@umx.com").first()
        if admin:
            print("Admin user already exists")
            return

        # Create admin user
        admin_data = UserCreate(
            email="admin@umx.com",
            password="admin123",  # Short password for bcrypt
            full_name="System Administrator",
            role=UserRole.ADMIN
        )

        AuthService.create_user(db, admin_data)
        print("✅ Admin user created successfully!")
        print("Email: admin@umx.com")
        print("Password: admin123")
        print("⚠️  Please change the default password after first login!")

    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin_user()