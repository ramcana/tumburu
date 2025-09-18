from pydantic import BaseSettings, Field, validator
from typing import List

class Settings(BaseSettings):
    API_KEY: str = Field(..., env="API_KEY")
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./app.db", env="DATABASE_URL")
    ALLOWED_ORIGINS: List[str] = Field(default=["http://localhost", "http://localhost:5173"], env="ALLOWED_ORIGINS")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    AUDIO_STORAGE_PATH: str = Field(default="app/static/audio", env="AUDIO_STORAGE_PATH")

    @validator("ALLOWED_ORIGINS", pre=True)
    def split_origins(cls, v):
        if isinstance(v, str):
            return [o.strip() for o in v.split(",")]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
