import {randomXtoY} from "../../core/utils.js";
import {type CaroGameState, type CaroSide, newCaroGame, playCaroTurn} from "./caro.engine.js";
import {applyMatchResult, getRatingsByUserIds} from "./caro-stat.service.js";

export type CaroRoom = {
  id: string;
  xPlayerId: string;
  xRating: number;
  xRatingAfter: number | null;
  oPlayerId: string;
  oRating: number;
  oRatingAfter: number | null;
  state: CaroGameState;
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
  };
  rooms.set(room.id, room);
  userRoom.set(playerA, room.id);
  userRoom.set(playerB, room.id);
  return room;
}

export async function playTurn(userId: string, x: number, y: number): Promise<CaroRoom | false> {
  const room = getRoomByUserId(userId);
  if(!room) return false;

  const newState = playCaroTurn(room.state, getSideOf(room, userId), x, y);
  if(!newState) return false;

  room.state = newState;
  if(newState.status !== "playing") {
    const {xNewRating, oNewRating} = await applyMatchResult(room.xPlayerId, room.oPlayerId, newState.winner);
    room.xRatingAfter = xNewRating;
    room.oRatingAfter = oNewRating;
    closeRoom(room);
  }
  return room;
}

function closeRoom(room: CaroRoom) {
  rooms.delete(room.id);
  userRoom.delete(room.xPlayerId);
  userRoom.delete(room.oPlayerId);
}
