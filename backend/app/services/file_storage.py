
import os
import shutil
import asyncio
import aiofiles
from pathlib import Path
from typing import Optional, Dict, Any, List, Union
from datetime import datetime, timedelta
import hashlib
import logging

from fastapi import UploadFile, HTTPException

logger = logging.getLogger(__name__)

class StorageBackend:
    async def save(self, file: UploadFile, dest_path: Path) -> Path:
        raise NotImplementedError
    async def delete(self, path: Path) -> None:
        raise NotImplementedError
    async def exists(self, path: Path) -> bool:
        raise NotImplementedError
    async def get(self, path: Path) -> bytes:
        raise NotImplementedError
    async def list(self, base: Path) -> List[Path]:
        raise NotImplementedError

class LocalStorageBackend(StorageBackend):
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile, dest_path: Path) -> Path:
        dest = self.base_dir / dest_path
        dest.parent.mkdir(parents=True, exist_ok=True)
        async with aiofiles.open(dest, 'wb') as out:
            while chunk := await file.read(1024 * 1024):
                await out.write(chunk)
        return dest

    async def delete(self, path: Path) -> None:
        try:
            os.remove(self.base_dir / path)
        except FileNotFoundError:
            pass

    async def exists(self, path: Path) -> bool:
        return (self.base_dir / path).exists()

    async def get(self, path: Path) -> bytes:
        async with aiofiles.open(self.base_dir / path, 'rb') as f:
            return await f.read()

    async def list(self, base: Path) -> List[Path]:
        base_path = self.base_dir / base
        return [p.relative_to(self.base_dir) for p in base_path.rglob('*') if p.is_file()]

class FileStorageService:
    def __init__(self, backend: StorageBackend, quota_bytes: int = 10**9):
        self.backend = backend
        self.quota_bytes = quota_bytes
        self.usage = 0
        self.lock = asyncio.Lock()

    async def save_file(self, file: UploadFile, user: str, genre: Optional[str] = None) -> Dict[str, Any]:
        # Organize by date/genre/user
        now = datetime.utcnow()
        date_str = now.strftime('%Y/%m/%d')
        genre = genre or 'unknown'
        filename = self._sanitize_filename(file.filename)
        dest_path = Path(user) / genre / date_str / filename
        # Deduplication: hash file
        file_hash = await self._hash_file(file)
        dest_path = dest_path.with_name(f"{file_hash[:8]}_{filename}")
        # Check quota
        async with self.lock:
            if self.usage + file.spool_max_size > self.quota_bytes:
                raise HTTPException(507, 'Storage quota exceeded')
            # Save file
            await file.seek(0)
            saved_path = await self.backend.save(file, dest_path)
            self.usage += (self.base_dir / saved_path).stat().st_size
        return {
            'path': str(saved_path),
            'hash': file_hash,
            'size': (self.base_dir / saved_path).stat().st_size,
            'created_at': now.isoformat(),
        }

    async def delete_file(self, path: str) -> None:
        async with self.lock:
            await self.backend.delete(Path(path))

    async def get_file(self, path: str) -> bytes:
        return await self.backend.get(Path(path))

    async def list_files(self, user: Optional[str] = None, genre: Optional[str] = None, date: Optional[str] = None) -> List[Dict[str, Any]]:
        base = Path(user or '') / (genre or '') / (date or '')
        files = await self.backend.list(base)
        return [{'path': str(f)} for f in files]

    async def cleanup(self, max_age_days: int = 30, lru: bool = False):
        # Remove files older than max_age_days or by LRU
        now = datetime.utcnow()
        for f in await self.backend.list(Path('.')):
            full_path = self.base_dir / f
            stat = full_path.stat()
            age = (now - datetime.utcfromtimestamp(stat.st_mtime)).days
            if age > max_age_days:
                await self.backend.delete(f)
            # TODO: LRU logic

    async def _hash_file(self, file: UploadFile) -> str:
        hasher = hashlib.sha256()
        await file.seek(0)
        while chunk := await file.read(1024 * 1024):
            hasher.update(chunk)
        await file.seek(0)
        return hasher.hexdigest()

    def _sanitize_filename(self, name: str) -> str:
        return ''.join(c for c in name if c.isalnum() or c in ('-', '_', '.')).strip()

    @property
    def base_dir(self):
        return self.backend.base_dir
