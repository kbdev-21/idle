import {WebSocket} from "ws";
import type {CaroRoom} from "../caro/caro-room.service.js";

export type AppWebSocket = WebSocket & {
  userId: string;
}

export type ClientMessage =
  | {type: "CARO:MATCHMAKING"}
  | {type: "CARO:CANCEL_MATCHMAKING"}
  | {type: "CARO:PLAY_TURN", data: {x: number, y: number}};

export type ClientMessageType = ClientMessage["type"];

export type ServerMessage =
  | {type: "CARO:MATCH_FOUND", data: CaroRoom}
  | {type: "CARO:GAME_STATE", data: CaroRoom}
  | {type: "CARO:GAME_OVER", data: CaroRoom}
  | {type: "ERROR", data: {message: string}};
