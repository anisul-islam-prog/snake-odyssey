import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-jwt")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 1 week

settings = Settings()
