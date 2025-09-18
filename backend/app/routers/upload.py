from fastapi import APIRouter, UploadFile, File
from app.services.file_storage import save_audio_file

router = APIRouter()

@router.post("/")
async def upload(file: UploadFile = File(...)):
    path = await save_audio_file(file.filename, file.file)
    return {"filename": file.filename, "path": path}
