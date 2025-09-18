import { useEffect, useRef } from 'react';
import { WebSocketClient, WebSocketMessage, WebSocketStatus } from '../services/websocket';
import { useWebSocketStore } from '../store/websocketStore';

interface UseWebSocketOptions {
  url: string;
  userId: string;
}

export function useWebSocket({ url, userId }: UseWebSocketOptions) {
  const setStatus = useWebSocketStore((s) => s.setStatus);
  const setLastMessage = useWebSocketStore((s) => s.setLastMessage);
  const enqueue = useWebSocketStore((s) => s.enqueue);
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocketClient({
      url,
      userId,
      onMessage: (msg: WebSocketMessage) => {
        setLastMessage(msg);
        enqueue(msg);
      },
      onStatusChange: (status: WebSocketStatus) => setStatus(status),
      reconnect: true,
    });
    return () => {
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, userId]);

  return wsRef.current;
}