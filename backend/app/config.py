from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Configuration
    groq_api_key: str
    groq_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    
    # App Configuration
    app_name: str = "CaloriePal"
    debug: bool = True

    # Security Configuration
    secret_key: str = "09876543210"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # Database Configuration
    database_url: str = "sqlite:///./caloriePal.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore unknown fields


@lru_cache()
def get_settings():
    return Settings()