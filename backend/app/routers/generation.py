from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.generation import GenerationRequest, GenerationResponse, AudioFile
from app.services.audio_generation import AudioGenerationService
from app.core.dependencies import get_db_session, get_audio_generation_service, get_correlation_id
from app.models.generation import Generation, AudioFile as AudioFileModel
from app.config.settings import settings
from datetime import datetime
import os
import uuid

router = APIRouter()

# In-memory store for demo (replace with DB in production)
GENERATIONS = {}
AUDIO_FILES = {}

@router.post("/generate", response_model=GenerationResponse)
async def start_generation(
    req: GenerationRequest,
    correlation_id: str = Depends(get_correlation_id),
    service: AudioGenerationService = Depends(get_audio_generation_service)
):
    try:
        meta = await service.generate(
            prompt=req.prompt,
            genre=req.genre,
            instruments=req.instruments,
            bpm=req.bpm,
            duration=req.duration,
            reference_audio_id=req.reference_audio_id
        )
        audio_id = uuid.uuid4().int >> 64
        audio = {"id": audio_id, **meta}
        AUDIO_FILES[audio_id] = audio
        gen_id = uuid.uuid4().int >> 64
        GENERATIONS[gen_id] = {
            "id": gen_id,
            "status": "completed",
            "audio_url": meta["url"],
            "metadata": meta,
            "created_at": meta["created_at"]
        }
        # TODO: Send progress/status via WebSocket if needed
        return GenerationResponse(
            id=gen_id,
            status="completed",
            audio_url=meta["url"],
            metadata=meta,
            created_at=meta["created_at"]
        )
    except Exception as e:
        # Log error and return graceful error response
        import logging
        logging.getLogger(__name__).error(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {e}")

@router.get("/generate/{id}", response_model=GenerationResponse)
async def get_generation_status(id: int):
    gen = GENERATIONS.get(id)
    if not gen:
        raise HTTPException(status_code=404, detail="Generation not found")
    return gen

@router.get("/audio/{id}", response_model=AudioFile)
async def get_audio_file(id: int):
    audio = AUDIO_FILES.get(id)
    if not audio:
        raise HTTPException(status_code=404, detail="Audio file not found")
    return audio

@router.post("/upload", response_model=AudioFile)
async def upload_reference_audio(file: UploadFile = File(...)):
    # Save file async
    filename = f"ref_{uuid.uuid4().hex}_{file.filename}"
    path = os.path.join(settings.AUDIO_STORAGE_PATH, filename)
    os.makedirs(settings.AUDIO_STORAGE_PATH, exist_ok=True)
    size = 0
    async with await asyncio.to_thread(open, path, 'wb') as out:
        content = await file.read()
        await asyncio.to_thread(out.write, content)
        size = len(content)
    audio_id = uuid.uuid4().int >> 64
    audio = {
        "id": audio_id,
        "filename": filename,
        "size": size,
        "duration": None,
        "format": file.content_type,
        "url": f"/static/audio/{filename}",
        "created_at": datetime.utcnow()
    }
    AUDIO_FILES[audio_id] = audio
    return audio

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({"msg": "Real-time updates not implemented in demo."})
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
