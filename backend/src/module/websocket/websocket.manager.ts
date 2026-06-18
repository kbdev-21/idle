import {WebSocketServer} from "ws";
import type {IncomingMessage} from "node:http";
import type {Duplex} from "node:stream";
import {auth} from "../../core/auth.js";
import {
  type CaroMatch,
  getCaroMatchByUserId, makeCaroMove,
  processTimeoutsForCurrentCaroMatches
} from "../caro/caro-match.service.js";
import type {AppWebSocket, ClientMessage, ServerMessage} from "./types.js";
import {joinCaroQueue, leftCaroQueue} from "../caro/caro-matchmaking.service.js";

const wss = new WebSocketServer({
  noServer: true,
});

const connectedUser = new Map<string, AppWebSocket>();

// ===== Upgrade + Auth =====

export async function handleWsUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
  const url = new URL(req.url ?? "", "http://localhost");
  const token = url.searchParams.get("token");
  if(!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const authUser = await auth.getUser(token);
  if(authUser.error || !authUser.data.user) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const userId = authUser.data.user.id;

  wss.handleUpgrade(req, socket, head, (ws) => {
    const appWs = ws as AppWebSocket;
    appWs.userId = userId;
    wss.emit("connection", appWs, req);
  });
}

// ===== Connection lifecycle =====

wss.on("connection", (ws: AppWebSocket) => {
  const oldWs = connectedUser.get(ws.userId);
  if(oldWs) {
    oldWs.close();
  }
  connectedUser.set(ws.userId, ws);
  console.log("User connected: " + ws.userId);

  // Resume: user đang trong match (vd vừa F5) -> gửi lại state hiện tại
  const match = getCaroMatchByUserId(ws.userId);
  if(match) {
    sendToUser(ws.userId, {type: "CARO:GAME_STATE", data: match});
  }

  ws.on("message", (raw) => {
    const message = parseClientMessage(raw.toString());
    if(!message) {
      ws.send(JSON.stringify({type: "ERROR", data: {message: "Invalid message"}}));
      return;
    }
    routeMessage(ws, message);
  });

  ws.on("close", () => {
    handleDisconnect(ws);
  });
});

function handleDisconnect(ws: AppWebSocket) {
  // Connection cũ bị kick bởi connection mới cũng chạy vào đây — user vẫn online, không dọn queue
  if(connectedUser.get(ws.userId) !== ws) return;

  connectedUser.delete(ws.userId);
  leftCaroQueue(ws.userId);
  // Disconnect KHÔNG ảnh hưởng room đang chơi — F5/rớt mạng vẫn giữ game (timer xử lý sau)
  console.log("User disconnected: " + ws.userId);
}

// ===== Message parsing + routing =====

function parseClientMessage(raw: string): ClientMessage | null {
  let message: any;
  try {
    message = JSON.parse(raw);
  } catch {
    return null;
  }

  switch(message?.type) {
    case "CARO:MATCHMAKING":
    case "CARO:CANCEL_MATCHMAKING":
      return {type: message.type};
    case "CARO:PLAY_TURN": {
      const x = message.data?.x;
      const y = message.data?.y;
      if(typeof x !== "number" || typeof y !== "number") return null;
      return {type: "CARO:PLAY_TURN", data: {x, y}};
    }
    default:
      return null;
  }
}

function routeMessage(ws: AppWebSocket, message: ClientMessage) {
  switch(message.type) {
    case "CARO:MATCHMAKING": {
      handleCaroMatchmaking(ws);
      break;
    }
    case "CARO:CANCEL_MATCHMAKING": {
      handleCaroCancelMatchmaking(ws);
      break;
    }
    case "CARO:PLAY_TURN": {
      handleCaroPlayTurn(ws, message.data.x, message.data.y);
      break;
    }
  }
}

// ===== Send helpers =====
function sendToUser(userId: string, message: ServerMessage): boolean {
  const ws = connectedUser.get(userId);
  if(!ws) return false;
  ws.send(JSON.stringify(message));
  return true;
}

function sendToMatch(match: CaroMatch, message: ServerMessage) {
  sendToUser(match.xPlayerId, message);
  sendToUser(match.oPlayerId, message);
}

function broadcastMatchState(match: CaroMatch) {
  if(match.state.status === "playing") sendToMatch(match, {type: "CARO:GAME_STATE", data: match});
  else sendToMatch(match, {type: "CARO:GAME_OVER", data: match});
}

// Tick: quét timeout mỗi giây -> random move cho người hết giờ rồi broadcast
setInterval(async () => {
  const affected = await processTimeoutsForCurrentCaroMatches(Date.now());
  for(const match of affected) broadcastMatchState(match);
}, 1000);

// ===== Message handlers =====

async function handleCaroMatchmaking(ws: AppWebSocket) {
  const match = await joinCaroQueue(ws.userId);
  if(match === false) {
    ws.send(JSON.stringify({type: "ERROR", data: {message: "Already in queue or playing"}}));
    return;
  }
  if(match === null) return;

  sendToMatch(match, {type: "CARO:MATCH_FOUND", data: match});
}

function handleCaroCancelMatchmaking(ws: AppWebSocket) {
  leftCaroQueue(ws.userId);
}

async function handleCaroPlayTurn(ws: AppWebSocket, x: number, y: number) {
  const match = await makeCaroMove(ws.userId, x, y);
  if(!match) {
    ws.send(JSON.stringify({type: "ERROR", data: {message: "Invalid move"}}));
    return;
  }

  broadcastMatchState(match);
}
