import os
from dotenv import load_dotenv

# Load .env file from parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

class Settings:
    MONGODB_URI: str = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DATABASE: str = os.environ.get("MONGODB_DATABASE", "hh_goa_2026")
    
    # Process CORS origins list
    CORS_ORIGINS_RAW: str = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    PUBLIC_BASE_URL: str = os.environ.get("PUBLIC_BASE_URL", "http://localhost:8000")
    MAX_UPLOAD_SIZE_MB: int = int(os.environ.get("MAX_UPLOAD_SIZE_MB", "15"))
    IMAGE_RETENTION_DAYS: int = int(os.environ.get("IMAGE_RETENTION_DAYS", "30"))

settings = Settings()
