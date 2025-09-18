

import asyncio
import os
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.services.stable_audio import StableAudioClient, StableAudioAPIError
from app.utils.audio_processing import validate_audio_file, cleanup_file, check_storage_space, is_corrupted
import logging

logger = logging.getLogger(__name__)

class AudioGenerationService:
    def __init__(self):
        self.queue = asyncio.Queue()
        self.rate_limit = asyncio.Semaphore(2)  # Example: 2 concurrent jobs
        self.client = StableAudioClient(api_key=settings.API_KEY)

    async def generate(self, prompt: str, genre: Optional[str] = None, instruments: Optional[list] = None, bpm: Optional[int] = None, duration: Optional[float] = None, reference_audio_id: Optional[int] = None) -> dict:
        # 1. Validate and queue request
        if not check_storage_space(settings.AUDIO_STORAGE_PATH):
            raise Exception("Insufficient storage space")
        payload = self._build_payload(prompt, genre, instruments, bpm, duration, reference_audio_id)
        job_id = None
        filename = f"gen_{uuid.uuid4().hex}.wav"
        file_path = os.path.join(settings.AUDIO_STORAGE_PATH, filename)
        try:
            async with self.rate_limit:
                # 2. Call Stable Audio API
                job_id = await self.client.generate_audio(payload)
                # 3. Poll for completion
                status = await self.client.poll_status(job_id)
                if status["status"] != "completed":
                    raise StableAudioAPIError(f"Generation failed: {status}")
                audio_url = status["audio_url"]
                # 4. Download audio
                await self.client.download_audio(audio_url, file_path)
                # 5. Validate audio file
                if not validate_audio_file(file_path) or is_corrupted(file_path):
                    cleanup_file(file_path)
                    raise Exception("Invalid or corrupted audio file")
                size = os.path.getsize(file_path)
                # 6. Return metadata
                return {
                    "filename": filename,
                    "size": size,
                    "duration": duration or 10.0,
                    "format": "wav",
                    "url": f"/static/audio/{filename}",
                    "created_at": datetime.utcnow()
                }
        except StableAudioAPIError as e:
            logger.error(f"Stable Audio API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            if os.path.exists(file_path):
                cleanup_file(file_path)
            raise

    def _build_payload(self, prompt, genre, instruments, bpm, duration, reference_audio_id) -> Dict[str, Any]:
        payload = {"prompt": prompt}
        if genre:
            payload["genre"] = genre
        if instruments:
            payload["instruments"] = instruments
        if bpm:
            payload["bpm"] = bpm
        if duration:
            payload["duration"] = duration
        if reference_audio_id:
            payload["reference_audio_id"] = reference_audio_id
        return payload
