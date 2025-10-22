import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import logging
import hashlib

from models.user import User
from schemas.auth import UserCreate, LoginRequest, TokenResponse, UserInDB
from config.config import settings

logger = logging.getLogger(__name__)

# Simple password hashing for now (replace with bcrypt later)
def simple_hash(password: str) -> str:
    """Simple password hashing using SHA256 + salt"""
    salt = "umx_salt_2025"
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

class AuthService:

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return simple_hash(plain_password) == hashed_password

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return simple_hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(
            or_(User.email == email, User.phone == email)  # Allow login with phone too
        ).first()

        if not user:
            return None
        if not AuthService.verify_password(password, user.password_hash):
            return None

        # Update last login info
        user.update_last_login()
        db.commit()
        db.refresh(user)

        logger.info(f"User {user.email} logged in successfully")
        return user

    @staticmethod
    def get_current_user(db: Session, token: str) -> Optional[User]:
        """Get current user from JWT token"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                return None
        except JWTError:
            return None

        user = db.query(User).filter(User.email == email).first()
        return user

    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """Create new user"""
        hashed_password = AuthService.get_password_hash(user_data.password)

        db_user = User(
            email=user_data.email,
            password_hash=hashed_password,
            full_name=user_data.full_name,
            role=user_data.role,
            phone=user_data.phone
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        logger.info(f"New user created: {db_user.email}")
        return db_user

    @staticmethod
    def login_user(db: Session, login_data: LoginRequest) -> Optional[TokenResponse]:
        """Login user and return token"""
        user = AuthService.authenticate_user(db, login_data.email, login_data.password)

        if not user:
            return None

        # Create access token
        access_token_expires = timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )

        # Return token response
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.JWT_EXPIRE_MINUTES * 60,  # Convert to seconds
            user={
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role.value,
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "login_count": user.login_count
            }
        )