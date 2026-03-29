from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Configuration
    groq_api_key: str
    groq_model: str 
    
    # App Configuration
    app_name: str 
    debug: bool 

    # Security Configuration
    secret_key: str 
    algorithm: str 
    access_token_expire_minutes: int

    # Database Configuration
    database_url: str 
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore unknown fields


@lru_cache()
def get_settings():
    return Settings()