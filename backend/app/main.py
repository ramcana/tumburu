import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from app.routers import generation
from app.config.settings import settings
import logging
import uuid

def setup_logging():
    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format="%(asctime)s [%(levelname)s] [%(correlation_id)s] %(name)s: %(message)s"
    )

class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = getattr(record, 'correlation_id', 'none')
        return True

setup_logging()
for handler in logging.getLogger().handlers:
    handler.addFilter(CorrelationIdFilter())

app = FastAPI(title="Tumburu API", version="1.0.0")

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    request.state.correlation_id = correlation_id
    logger = logging.getLogger()
    for handler in logger.handlers:
        handler.addFilter(lambda record: setattr(record, 'correlation_id', correlation_id) or True)
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled error: {exc}")
    return {"detail": "Internal server error"}

app.mount("/static/audio", StaticFiles(directory=settings.AUDIO_STORAGE_PATH), name="audio")

app.include_router(generation.router, prefix="/api", tags=["generation"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
