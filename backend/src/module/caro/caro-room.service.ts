import {randomXtoY} from "../../core/utils.js";
import {type CaroGameState, type CaroSide, type CaroSquare, newCaroGame, playCaroTurn} from "./caro.engine.js";
import {applyMatchResult, getRatingsByUserIds} from "./caro-stat.service.js";

const TURN_TIME_LIMIT_MS = 20_000;

export type CaroRoom = {
  id: string;
  xPlayerId: string;
  xRating: number;
  xRatingAfter: number | null;
  oPlayerId: string;
  oRating: number;
  oRatingAfter: number | null;
  state: CaroGameState;
  lastMoveAt: number;
};

const rooms = new Map<string, CaroRoom>();
const userRoom = new Map<string, string>();

export function getRoomById(roomId: string): CaroRoom | undefined {
  return rooms.get(roomId);
}

export function getRoomByUserId(userId: string): CaroRoom | undefined {
  const roomId = userRoom.get(userId);
  if(!roomId) return undefined;
  return rooms.get(roomId);
}

export function isUserPlaying(userId: string): boolean {
  return userRoom.has(userId);
}

export function getSideOf(room: CaroRoom, userId: string): CaroSide {
  return room.xPlayerId === userId ? "X" : "O";
}

export async function createRoom(playerA: string, playerB: string): Promise<CaroRoom> {
  const [playerX, playerO] = randomXtoY(0, 1) === 0 ? [playerA, playerB] : [playerB, playerA];

  const ratings = await getRatingsByUserIds([playerX, playerO]);

  const room: CaroRoom = {
    id: crypto.randomUUID(),
    xPlayerId: playerX,
    xRating: ratings.get(playerX) ?? 0,
    xRatingAfter: null,
    oPlayerId: playerO,
    oRating: ratings.get(playerO) ?? 0,
    oRatingAfter: null,
    state: newCaroGame("X"),
    lastMoveAt: Date.now(),
  };
  rooms.set(room.id, room);
  userRoom.set(playerA, room.id);
  userRoom.set(playerB, room.id);
  return room;
}

export async function playTurn(userId: string, x: number, y: number): Promise<CaroRoom | false> {
  const room = getRoomByUserId(userId);
  if(!room) return false;
  return applyMove(room, getSideOf(room, userId), x, y);
}

async function applyMove(room: CaroRoom, side: CaroSide, x: number, y: number): Promise<CaroRoom | false> {
  const newState = playCaroTurn(room.state, side, x, y);
  if(!newState) return false;

  room.state = newState;
  room.lastMoveAt = Date.now(); // sync, set TRƯỚC mọi await
  if(newState.status !== "playing") {
    const {xNewRating, oNewRating} = await applyMatchResult(room.xPlayerId, room.oPlayerId, newState.winner);
    room.xRatingAfter = xNewRating;
    room.oRatingAfter = oNewRating;
    closeRoom(room);
  }
  return room;
}

// Quét room quá hạn lượt -> đánh random ô trống cho người hết giờ. Trả về các room bị ảnh hưởng để broadcast.
export async function processTimeouts(now: number): Promise<CaroRoom[]> {
  const timedOut: CaroRoom[] = [];
  for(const room of rooms.values()) {
    if(room.state.status === "playing" && now - room.lastMoveAt >= TURN_TIME_LIMIT_MS) timedOut.push(room);
  }

  const affected: CaroRoom[] = [];
  for(const room of timedOut) {
    if(room.state.status !== "playing") continue; // re-check sau await
    if(now - room.lastMoveAt < TURN_TIME_LIMIT_MS) continue; // re-check: có move trong lúc await
    const move = pickRandomEmptyCell(room.state.board);
    if(!move) continue;
    const updated = await applyMove(room, room.state.turnOf, move.x, move.y);
    if(updated) affected.push(updated);
  }
  return affected;
}

function pickRandomEmptyCell(board: CaroSquare[][]): {x: number; y: number} | null {
  const empties: {x: number; y: number}[] = [];
  for(let x = 0; x < board.length; x++) for(let y = 0; y < board[x].length; y++) if(board[x][y] === null) empties.push({x, y});
  if(empties.length === 0) return null;
  return empties[randomXtoY(0, empties.length - 1)];
}


function closeRoom(room: CaroRoom) {
  rooms.delete(room.id);
  userRoom.delete(room.xPlayerId);
  userRoom.delete(room.oPlayerId);
}
