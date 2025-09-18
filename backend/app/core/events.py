from typing import Callable, Dict, List, Any
import asyncio

class EventEmitter:
    def __init__(self):
        self._listeners: Dict[str, List[Callable[..., Any]]] = {}
        self._lock = asyncio.Lock()

    async def on(self, event: str, listener: Callable[..., Any]):
        async with self._lock:
            if event not in self._listeners:
                self._listeners[event] = []
            self._listeners[event].append(listener)

    async def emit(self, event: str, *args, **kwargs):
        async with self._lock:
            listeners = self._listeners.get(event, []).copy()
        for listener in listeners:
            await listener(*args, **kwargs)

# Singleton event emitter for generation events
emitter = EventEmitter()
