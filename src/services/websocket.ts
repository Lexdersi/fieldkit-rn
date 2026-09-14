type WebSocketListener = (data: any) => void;

export class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<WebSocketListener> = new Set();
  private attempt = 0;
  private isIntentionalClose = false;

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    if (this.isIntentionalClose) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      if (__DEV__) console.log('[WebSocket] Connected');
      this.attempt = 0; // Reset backoff on successful connection
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(data));
      } catch (err) {
        if (__DEV__) console.log('[WebSocket] Failed to parse message', event.data);
      }
    };

    this.ws.onerror = (error) => {
      if (__DEV__) console.log('[WebSocket] Error:', error);
    };

    this.ws.onclose = () => {
      if (this.isIntentionalClose) return;

      this.attempt++;
      // Exponential backoff: 1s, 2s, 4s, capped at 30s
      const delay = Math.min(Math.pow(2, this.attempt - 1) * 1000, 30_000);

      if (__DEV__) console.log(`[WebSocket] Disconnected. Reconnecting in ${delay}ms (attempt ${this.attempt})...`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    };
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      if (__DEV__) console.warn('[WebSocket] Cannot send, socket is not open.');
    }
  }

  public subscribe(listener: WebSocketListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public close() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close();
    }
  }
}