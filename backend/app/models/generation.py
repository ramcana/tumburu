
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.models.base import Base
from datetime import datetime

class Generation(Base):
    __tablename__ = "generations"
    id = Column(Integer, primary_key=True, index=True)
    prompt = Column(String, nullable=False)
    genre = Column(String, nullable=True)
    instruments = Column(String, nullable=True)  # Comma-separated
    bpm = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    status = Column(String, default="pending")
    audio_id = Column(Integer, ForeignKey("audio_files.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    audio = relationship("AudioFile", back_populates="generation", uselist=False)


class AudioFile(Base):
    __tablename__ = "audio_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    size = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    format = Column(String, nullable=True)
    url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    generation = relationship("Generation", back_populates="audio", uselist=False)
