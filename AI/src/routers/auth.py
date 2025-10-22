import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import logging

from config.database import get_db
from services.auth_service import AuthService
from schemas.auth import LoginRequest, TokenResponse, UserCreate, UserInDB
from models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    User login endpoint.

    - Validates credentials
    - Updates last_login timestamp in database
    - Returns JWT token
    """
    try:
        token_response = AuthService.login_user(db, login_data)

        if not token_response:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        logger.info(f"Login successful for user: {login_data.email}")
        return token_response

    except Exception as e:
        logger.error(f"Login failed for {login_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/register", response_model=UserInDB)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    User registration endpoint.

    - Creates new user in database
    - Hashes password
    - Returns user info
    """
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        new_user = AuthService.create_user(db, user_data)
        logger.info(f"Registration successful for user: {user_data.email}")
        return new_user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed for {user_data.email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.get("/me", response_model=UserInDB)
def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """
    Get current user information.

    - Requires valid JWT token
    - Returns user profile data
    """
    try:
        token = credentials.credentials
        user = AuthService.get_current_user(db, token)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )

@router.post("/logout")
def logout():
    """
    Logout endpoint.

    Note: Since JWT is stateless, logout is handled on client side
    by removing the token. This endpoint is for future enhancements.
    """
    return {"message": "Logged out successfully"}