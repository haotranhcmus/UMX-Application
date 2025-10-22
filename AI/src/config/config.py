from pydantic_settings import BaseSettings
from typing import List
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    
    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    
    # API
    API_VERSION: str = "v1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Email
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str
    SUPPORT_EMAIL: str = ""
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5242880  # 5MB
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,pdf"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:19006"
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        return self.ALLOWED_EXTENSIONS.split(",")
    
    @property
    def cors_origins_list(self) -> List[str]:
        return self.CORS_ORIGINS.split(",")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Singleton instance
settings = Settings()