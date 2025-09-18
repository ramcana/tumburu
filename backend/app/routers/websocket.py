from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.services.websocket_manager import WebSocketManager
from app.core.events import emitter
import logging

router = APIRouter()
ws_manager = WebSocketManager()
logger = logging.getLogger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user_id: str = Query(...)):
    # TODO: Add authentication/validation for user_id
    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Optionally handle incoming messages from client
    except WebSocketDisconnect:
        await ws_manager.disconnect(user_id, websocket)
        logger.info(f"WebSocket disconnected: {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await ws_manager.disconnect(user_id, websocket)

# Example event integration (to be called from generation service):
async def broadcast_generation_event(event_type: str, user_id: str, payload: dict):
    message = {"type": event_type, **payload}
    await ws_manager.send_personal_message(user_id, message)

# Register event listeners for generation events
async def on_generation_started(user_id, payload):
    await broadcast_generation_event("generation_started", user_id, payload)
async def on_generation_progress(user_id, payload):
    await broadcast_generation_event("generation_progress", user_id, payload)
async def on_generation_completed(user_id, payload):
    await broadcast_generation_event("generation_completed", user_id, payload)
async def on_generation_failed(user_id, payload):
    await broadcast_generation_event("generation_failed", user_id, payload)
async def on_queue_updated(user_id, payload):
    await broadcast_generation_event("queue_updated", user_id, payload)

emitter.on("generation_started", on_generation_started)
emitter.on("generation_progress", on_generation_progress)
emitter.on("generation_completed", on_generation_completed)
emitter.on("generation_failed", on_generation_failed)
emitter.on("queue_updated", on_queue_updated)
