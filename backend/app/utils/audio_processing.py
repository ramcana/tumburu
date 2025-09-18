import os
import logging
import shutil
from typing import Optional

logger = logging.getLogger(__name__)

def validate_audio_file(file_path: str) -> bool:
    # Check file exists and is a valid audio file (basic check)
    if not os.path.exists(file_path):
        logger.error(f"Audio file not found: {file_path}")
        return False
    # TODO: Add real audio validation (magic bytes, format, etc.)
    return True

def cleanup_file(file_path: str) -> None:
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up file: {file_path}")
    except Exception as e:
        logger.error(f"Failed to clean up file {file_path}: {e}")

def check_storage_space(path: str, min_free_mb: int = 100) -> bool:
    total, used, free = shutil.disk_usage(path)
    free_mb = free // (1024 * 1024)
    if free_mb < min_free_mb:
        logger.error(f"Low storage space: {free_mb}MB free at {path}")
        return False
    return True

def is_corrupted(file_path: str) -> bool:
    # Dummy check for corruption (could use audio libraries for real check)
    try:
        with open(file_path, 'rb') as f:
            header = f.read(4)
            if not header:
                return True
    except Exception:
        return True
    return False
