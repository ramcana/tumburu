import { create } from 'zustand';
import { WebSocketStatus, WebSocketMessage } from '../services/websocket';

interface WebSocketState {
  status: WebSocketStatus;
  lastMessage: WebSocketMessage | null;
  queue: WebSocketMessage[];
  setStatus: (status: WebSocketStatus) => void;
  setLastMessage: (msg: WebSocketMessage) => void;
  enqueue: (msg: WebSocketMessage) => void;
  dequeue: () => WebSocketMessage | undefined;
  clearQueue: () => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  status: 'closed',
  lastMessage: null,
  queue: [],
  setStatus: (status) => set({ status }),
  setLastMessage: (msg) => set({ lastMessage: msg }),
  enqueue: (msg) => set((state) => ({ queue: [...state.queue, msg] })),
  dequeue: () => {
    const [first, ...rest] = get().queue;
    set({ queue: rest });
    return first;
  },
  clearQueue: () => set({ queue: [] }),
}));
