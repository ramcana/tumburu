from pydantic import BaseModel, Field, validator, conint, constr, confloat
from typing import Optional, List
from datetime import datetime

class GenerationRequest(BaseModel):
    prompt: constr(min_length=3, max_length=512)
    genre: Optional[constr(max_length=64)] = None
    instruments: Optional[List[constr(max_length=32)]] = None
    bpm: Optional[conint(ge=40, le=300)] = None
    duration: Optional[confloat(gt=0, le=600)] = None
    reference_audio_id: Optional[int] = None

    @validator('instruments', pre=True)
    def split_instruments(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(',')]
        return v

class GenerationResponse(BaseModel):
    id: int
    status: str
    audio_url: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime

    class Config:
        orm_mode = True

class AudioFile(BaseModel):
    id: int
    filename: str
    size: Optional[int]
    duration: Optional[float]
    format: Optional[str]
    url: str
    created_at: datetime

    class Config:
        orm_mode = True
