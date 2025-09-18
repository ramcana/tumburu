import os
import tempfile
import mimetypes
import hashlib
import shutil
import asyncio
from pathlib import Path
from typing import Optional, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException
from pydub import AudioSegment
import magic
import audioread
import logging

logger = logging.getLogger(__name__)

SUPPORTED_FORMATS = {"audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/flac": "flac", "audio/x-flac": "flac", "audio/mp4": "m4a", "audio/x-m4a": "m4a", "audio/ogg": "ogg"}
MAX_FILE_SIZE_MB = 100
MAX_DURATION_SEC = 600
MIN_BITRATE = 64000
MIN_SAMPLE_RATE = 22050

# --- File Validation ---
def detect_mime_type(file_path: Path) -> str:
    mime = magic.Magic(mime=True)
    return mime.from_file(str(file_path))

def validate_audio_file(file_path: Path) -> Dict[str, Any]:
    mime_type = detect_mime_type(file_path)
    if mime_type not in SUPPORTED_FORMATS:
        raise HTTPException(415, f"Unsupported audio format: {mime_type}")
    ext = SUPPORTED_FORMATS[mime_type]
    size_mb = file_path.stat().st_size / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(413, f"File too large: {size_mb:.2f} MB")
    # Analyze audio
    try:
        with audioread.audio_open(str(file_path)) as f:
            duration = f.duration
            if duration > MAX_DURATION_SEC:
                raise HTTPException(413, f"Audio too long: {duration:.1f} sec")
            sample_rate = f.samplerate
            channels = f.channels
            bitrate = getattr(f, 'bitrate', None) or MIN_BITRATE
    except Exception as e:
        raise HTTPException(400, f"Invalid or corrupted audio: {e}")
    if sample_rate < MIN_SAMPLE_RATE:
        raise HTTPException(400, f"Sample rate too low: {sample_rate}")
    if bitrate < MIN_BITRATE:
        raise HTTPException(400, f"Bitrate too low: {bitrate}")
    return {
        "mime_type": mime_type,
        "ext": ext,
        "size_mb": size_mb,
        "duration": duration,
        "sample_rate": sample_rate,
        "channels": channels,
        "bitrate": bitrate,
    }

# --- Audio Processing ---
def extract_metadata(file_path: Path) -> Dict[str, Any]:
    audio = AudioSegment.from_file(file_path)
    return {
        "duration": len(audio) / 1000.0,
        "channels": audio.channels,
        "frame_rate": audio.frame_rate,
        "sample_width": audio.sample_width,
        # Add more as needed (BPM, key, etc.)
    }

def convert_format(file_path: Path, target_format: str) -> Path:
    audio = AudioSegment.from_file(file_path)
    out_path = file_path.with_suffix(f'.{target_format}')
    audio.export(out_path, format=target_format)
    return out_path

def generate_waveform_data(file_path: Path, samples: int = 512) -> list:
    audio = AudioSegment.from_file(file_path)
    raw = audio.get_array_of_samples()
    step = max(1, len(raw) // samples)
    peaks = [max(raw[i:i+step]) for i in range(0, len(raw), step)]
    return peaks

def normalize_audio(file_path: Path) -> Path:
    audio = AudioSegment.from_file(file_path)
    normalized = audio.apply_gain(-audio.max_dBFS)
    out_path = file_path.with_name(file_path.stem + '_norm' + file_path.suffix)
    normalized.export(out_path, format=file_path.suffix[1:])
    return out_path

def generate_thumbnail(file_path: Path, out_path: Optional[Path] = None) -> Path:
    # Placeholder: could generate waveform PNG or spectrogram
    if out_path is None:
        out_path = file_path.with_name(file_path.stem + '_thumb.png')
    # ... generate and save thumbnail ...
    return out_path

# --- File Operations ---
def safe_filename(name: str) -> str:
    return ''.join(c for c in name if c.isalnum() or c in ('-', '_', '.')).strip()

def hash_file(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        while chunk := f.read(1024 * 1024):
            hasher.update(chunk)
    return hasher.hexdigest()

def atomic_copy(src: Path, dst: Path) -> None:
    tmp = dst.with_suffix('.tmp')
    shutil.copy2(src, tmp)
    os.replace(tmp, dst)

def create_temp_file(suffix: str = '') -> tempfile.NamedTemporaryFile:
    return tempfile.NamedTemporaryFile(delete=True, suffix=suffix)

def cleanup_temp_files(tmp_dir: Path, max_age_sec: int = 3600):
    now = datetime.now().timestamp()
    for f in tmp_dir.glob('*'):
        if f.is_file() and now - f.stat().st_mtime > max_age_sec:
            f.unlink()

# --- Integration Utilities ---
def detect_file_type(file_path: Path) -> Tuple[str, str]:
    mime = detect_mime_type(file_path)
    ext = SUPPORTED_FORMATS.get(mime, file_path.suffix[1:])
    return mime, ext

def generate_storage_path(user: str, genre: str, date: str, filename: str) -> Path:
    return Path(user) / genre / date / safe_filename(filename)

async def async_process_audio(file_path: Path, func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, func, file_path, *args, **kwargs)

def get_file_size(path: str) -> int:
    return os.path.getsize(path)
