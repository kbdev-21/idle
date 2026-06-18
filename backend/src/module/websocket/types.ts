import {WebSocket} from "ws";
import type {CaroMatchPayload} from "../caro/service/caro-matches-management.service.js";

export type AppWebSocket = WebSocket & {
  userId: string;
}

export type ClientMessage =
  | {type: "CARO:MATCHMAKING"}
  | {type: "CARO:CANCEL_MATCHMAKING"}
  | {type: "CARO:PLAY_TURN", data: {x: number, y: number}};

export type ClientMessageType = ClientMessage["type"];

export type ServerMessage =
  | {type: "CARO:MATCH_FOUND", data: CaroMatchPayload}
  | {type: "CARO:GAME_STATE", data: CaroMatchPayload}
  | {type: "CARO:GAME_OVER", data: CaroMatchPayload}
  | {type: "ERROR", data: {message: string}};
