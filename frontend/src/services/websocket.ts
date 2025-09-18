// WebSocket client for real-time generation updates
// Handles reconnection, event dispatch, and message queue

export type WebSocketEventType =
  | 'generation_started'
  | 'generation_progress'
  | 'generation_completed'
  | 'generation_failed'
  | 'queue_updated';

export interface WebSocketMessageBase {
  type: WebSocketEventType;
  id?: string | number;
}

export interface GenerationStartedMessage extends WebSocketMessageBase {
  type: 'generation_started';
  position_in_queue: number;
  eta: number;
}
export interface GenerationProgressMessage extends WebSocketMessageBase {
  type: 'generation_progress';
  progress: number;
  stage: string;
  eta: number;
}
export interface GenerationCompletedMessage extends WebSocketMessageBase {
  type: 'generation_completed';
  audio_url: string;
  metadata: any;
}
export interface GenerationFailedMessage extends WebSocketMessageBase {
  type: 'generation_failed';
  error: string;
  retry_available: boolean;
}
export interface QueueUpdatedMessage extends WebSocketMessageBase {
  type: 'queue_updated';
  position: number;
  total_queue_size: number;
  eta: number;
}

export type WebSocketMessage =
  | GenerationStartedMessage
  | GenerationProgressMessage
  | GenerationCompletedMessage
  | GenerationFailedMessage
  | QueueUpdatedMessage;

export type WebSocketEventHandler = (msg: WebSocketMessage) => void;

export interface WebSocketClientOptions {
  url: string;
  userId: string;
  onMessage: WebSocketEventHandler;
  onStatusChange?: (status: WebSocketStatus) => void;
  reconnect?: boolean;
}

export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error' | 'reconnecting';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private userId: string;
  private onMessage: WebSocketEventHandler;
  private onStatusChange?: (status: WebSocketStatus) => void;
  private reconnect: boolean;
  private reconnectAttempts = 0;
  private status: WebSocketStatus = 'closed';
  private messageQueue: WebSocketMessage[] = [];
  private reconnectTimeout: any = null;

  constructor(options: WebSocketClientOptions) {
    this.url = options.url;
    this.userId = options.userId;
    this.onMessage = options.onMessage;
    this.onStatusChange = options.onStatusChange;
    this.reconnect = options.reconnect ?? true;
    this.connect();
  }

  private setStatus(status: WebSocketStatus) {
    this.status = status;
    this.onStatusChange?.(status);
  }

  private connect() {
    this.setStatus('connecting');
    const wsUrl = `${this.url}?user_id=${encodeURIComponent(this.userId)}`;
    this.ws = new WebSocket(wsUrl);
    this.ws.onopen = () => {
      this.setStatus('open');
      this.reconnectAttempts = 0;
      // Flush queued messages
      while (this.messageQueue.length > 0) {
        const msg = this.messageQueue.shift();
        if (msg) this.send(msg);
      }
    };
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      } catch (e) {
        // Ignore malformed
      }
    };
    this.ws.onclose = () => {
      this.setStatus('closed');
      if (this.reconnect) this.scheduleReconnect();
    };
    this.ws.onerror = () => {
      this.setStatus('error');
      if (this.reconnect) this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.setStatus('reconnecting');
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  send(msg: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      this.messageQueue.push(msg);
    }
  }

  close() {
    this.reconnect = false;
    if (this.ws) this.ws.close();
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.setStatus('closed');
  }

  getStatus() {
    return this.status;
  }
}