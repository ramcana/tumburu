import asyncio
from typing import Dict, Set, Any
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.lock = asyncio.Lock()

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)
        logger.info(f"WebSocket connected: {user_id}")

    async def disconnect(self, user_id: str, websocket: WebSocket):
        async with self.lock:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
        logger.info(f"WebSocket disconnected: {user_id}")

    async def send_personal_message(self, user_id: str, message: Any):
        async with self.lock:
            conns = self.active_connections.get(user_id, set()).copy()
        for ws in conns:
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.error(f"Failed to send message to {user_id}: {e}")

    async def broadcast(self, message: Any):
        async with self.lock:
            all_conns = [ws for conns in self.active_connections.values() for ws in conns]
        for ws in all_conns:
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.error(f"Broadcast failed: {e}")

    async def cleanup(self):
        async with self.lock:
            for user_id, conns in list(self.active_connections.items()):
                for ws in list(conns):
                    await ws.close()
                self.active_connections[user_id].clear()
            self.active_connections.clear()
