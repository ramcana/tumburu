
from fastapi import APIRouter, UploadFile, File, Query, HTTPException, Response, status, Depends
from fastapi.responses import StreamingResponse, FileResponse
from typing import List, Optional
from pathlib import Path
import os
import aiofiles
import mimetypes
import tempfile
from ..services.file_storage import FileStorageService, LocalStorageBackend
from ..utils import file_utils
import logging

router = APIRouter(prefix="/api/audio", tags=["audio"])

# Dependency: get storage service
BASE_DIR = Path(os.getenv("AUDIO_STORAGE_DIR", "app/static/audio"))
storage = FileStorageService(LocalStorageBackend(BASE_DIR))

# --- Core CRUD Endpoints ---
@router.get("/", response_model=List[dict])
async def list_audio(
    user: Optional[str] = None,
    genre: Optional[str] = None,
    date: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    files = await storage.list_files(user, genre, date)
    # TODO: Add filtering, search, pagination
    return files[offset:offset+limit]

@router.get("/{file_id}")
async def get_audio(file_id: str, range: Optional[str] = None):
    file_path = BASE_DIR / file_id
    if not file_path.exists():
        raise HTTPException(404, "File not found")
    # Range request support
    file_size = file_path.stat().st_size
    headers = {}
    if range:
        start, end = 0, file_size - 1
        if range.startswith("bytes="):
            parts = range[6:].split("-")
            if parts[0]: start = int(parts[0])
            if len(parts) > 1 and parts[1]: end = int(parts[1])
        length = end - start + 1
        async def file_stream():
            async with aiofiles.open(file_path, 'rb') as f:
                await f.seek(start)
                remaining = length
                while remaining > 0:
                    chunk = await f.read(min(65536, remaining))
                    if not chunk: break
                    yield chunk
                    remaining -= len(chunk)
        headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
        return StreamingResponse(file_stream(), status_code=206, headers=headers, media_type=mimetypes.guess_type(str(file_path))[0])
    return FileResponse(file_path, media_type=mimetypes.guess_type(str(file_path))[0])

@router.post("/upload", status_code=201)
async def upload_audio(file: UploadFile = File(...), user: str = Query(...), genre: Optional[str] = None):
    # Save, validate, process
    tmp = Path(tempfile.mktemp())
    async with aiofiles.open(tmp, 'wb') as out:
        while chunk := await file.read(1024 * 1024):
            await out.write(chunk)
    meta = file_utils.validate_audio_file(tmp)
    # Optionally process/convert/normalize
    # ...
    result = await storage.save_file(file, user, genre)
    tmp.unlink(missing_ok=True)
    return {"meta": meta, **result}

@router.delete("/{file_id}", status_code=204)
async def delete_audio(file_id: str):
    await storage.delete_file(file_id)
    return Response(status_code=204)

@router.patch("/{file_id}")
async def update_audio_metadata(file_id: str, metadata: dict):
    # TODO: Update metadata/tags in DB or index
    return {"id": file_id, "updated": True}

# --- Advanced Endpoints ---
@router.get("/{file_id}/metadata")
async def get_audio_metadata(file_id: str):
    file_path = BASE_DIR / file_id
    if not file_path.exists():
        raise HTTPException(404, "File not found")
    meta = file_utils.extract_metadata(file_path)
    return meta

@router.get("/{file_id}/thumbnail")
async def get_audio_thumbnail(file_id: str):
    file_path = BASE_DIR / file_id
    if not file_path.exists():
        raise HTTPException(404, "File not found")
    thumb = file_utils.generate_thumbnail(file_path)
    return FileResponse(thumb, media_type="image/png")

@router.post("/batch")
async def batch_audio_ops(action: str, file_ids: List[str]):
    # Example: delete or download zip
    if action == "delete":
        for fid in file_ids:
            await storage.delete_file(fid)
        return {"deleted": file_ids}
    # TODO: implement download zip
    return {"action": action, "files": file_ids}

@router.get("/search")
async def search_audio(q: str, user: Optional[str] = None, genre: Optional[str] = None):
    # TODO: Implement full-text and metadata search
    files = await storage.list_files(user, genre)
    # ... filter by q ...
    return files

@router.get("/similar/{file_id}")
async def find_similar_audio(file_id: str):
    # TODO: Implement audio similarity search
    return {"similar": []}
