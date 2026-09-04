import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Market Pulse API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "market-pulse-super-secret-jwt-key-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./market_pulse.db")
    
    # Provider Settings
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    DEFAULT_MARKET_PROVIDER: str = os.getenv("DEFAULT_MARKET_PROVIDER", "demo")
    
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
