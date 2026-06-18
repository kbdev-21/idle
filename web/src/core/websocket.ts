// ===== Message types (mirror backend: module/websocket/types.ts) =====
import type { CaroMatch } from "@/core/caro-types.ts";

export type ClientMessage =
  | { type: "CARO:MATCHMAKING" }
  | { type: "CARO:CANCEL_MATCHMAKING" }
  | { type: "CARO:PLAY_TURN"; data: { x: number; y: number } };

export type ServerMessage =
  | { type: "CARO:MATCH_FOUND"; data: CaroMatch }
  | { type: "CARO:GAME_STATE"; data: CaroMatch }
  | { type: "CARO:GAME_OVER"; data: CaroMatch }
  | { type: "ERROR"; data: { message: string } };

type Listener = (message: ServerMessage) => void;

// http://host -> ws://host, https://host -> wss://host
const WS_URL = import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws");

let socket: WebSocket | null = null;
let token: string | null = null;
let closed = false;
const listeners = new Set<Listener>();

function open() {
  if (socket || !token || closed) return; // giữ đúng 1 socket
  const ws = new WebSocket(`${WS_URL}?token=${token}`);
  socket = ws;

  ws.onmessage = (e) => {
    try {
      const message: ServerMessage = JSON.parse(e.data);
      listeners.forEach((l) => l(message));
    } catch {
      // bỏ qua message hỏng
    }
  };

  ws.onclose = () => {
    socket = null;
    if (!closed) setTimeout(open, 1000); // rớt thì thử lại
  };
}

export const realtime = {
  // gọi mỗi khi có session (kể cả token refresh) — token mới nhất luôn được giữ
  connect(accessToken: string) {
    token = accessToken;
    closed = false;
    open();
  },

  disconnect() {
    closed = true;
    socket?.close();
    socket = null;
  },

  send(message: ClientMessage): boolean {
    if (socket?.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(message));
    return true;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
