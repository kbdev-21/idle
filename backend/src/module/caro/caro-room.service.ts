import {randomXtoY} from "../../core/utils.js";
import {type CaroGameState, type CaroSide, newCaroGame, playCaroTurn} from "./caro.engine.js";

export type CaroRoom = {
  id: string;
  players: {X: string, O: string};
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
  return room.players.X === userId ? "X" : "O";
}

export function createRoom(playerA: string, playerB: string): CaroRoom {
  const [playerX, playerO] = randomXtoY(0, 1) === 0 ? [playerA, playerB] : [playerB, playerA];

  const room: CaroRoom = {
    id: crypto.randomUUID(),
    players: {X: playerX, O: playerO},
    state: newCaroGame("X"),
  };
  rooms.set(room.id, room);
  userRoom.set(playerA, room.id);
  userRoom.set(playerB, room.id);
  return room;
}

export function playTurn(userId: string, x: number, y: number): CaroRoom | false {
  const room = getRoomByUserId(userId);
  if(!room) return false;

  const newState = playCaroTurn(room.state, getSideOf(room, userId), x, y);
  if(!newState) return false;

  room.state = newState;
  if(newState.status !== "playing") {
    closeRoom(room);
  }
  return room;
}

function closeRoom(room: CaroRoom) {
  rooms.delete(room.id);
  userRoom.delete(room.players.X);
  userRoom.delete(room.players.O);
}
