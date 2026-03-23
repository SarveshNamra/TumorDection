import os
from pathlib import Path
from pydantic_settings import BaseSettings

# This class holds all your settings
class Settings(BaseSettings):
    """Application settings"""
    
    # Basic info
    APP_NAME: str = "NeuroGenAI ML Service"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True  # Show detailed errors (turn off in production)
    
    MODEL_PATH: str = "models/brain_tumor_model.h5"
    INPUT_SIZE: tuple = (128, 128)  # 128x128 pixels
    NUM_CLASSES: int = 4
    
    CLASS_LABELS: dict = {
        0: "GLIOMA",      # First class
        1: "MENINGIOMA",  # Second class
        2: "NO_TUMOR",    # Third class
        3: "PITUITARY"    # Fourth class
    }
    
    NORMALIZE_RANGE: tuple = (0, 1)  # Scale pixel values 0-1
    
    HOST: str = "0.0.0.0"  # Listen on all network interfaces
    PORT: int = 8000       # Port number
    
    ALLOWED_ORIGINS: list = [
        "http://localhost:8080",  # Your Node.js backend
        "http://localhost:5173",  # Your React frontend
    ]
    
    class Config:
        env_file = ".env"  # Load from .env file
        case_sensitive = True

settings = Settings()

MODEL_DIR = Path(settings.MODEL_PATH).parent
MODEL_DIR.mkdir(parents=True, exist_ok=True)