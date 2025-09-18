from fastapi import Depends, Request
from app.config.database import get_db
from app.services.audio_generation import AudioGenerationService

def get_db_session():
    return Depends(get_db)

def get_audio_generation_service():
    return AudioGenerationService()

async def get_correlation_id(request: Request) -> str:
    return request.headers.get("X-Correlation-ID", "none")
