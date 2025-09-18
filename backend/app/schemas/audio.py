from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AudioBase(BaseModel):
    filename: str
    url: str

class AudioCreate(AudioBase):
    pass

class AudioOut(AudioBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True
