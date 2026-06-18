import {WebSocket} from "ws";
import type {CaroMatch} from "../caro/caro-match.service.js";

export type AppWebSocket = WebSocket & {
  userId: string;
}

export type ClientMessage =
  | {type: "CARO:MATCHMAKING"}
  | {type: "CARO:CANCEL_MATCHMAKING"}
  | {type: "CARO:PLAY_TURN", data: {x: number, y: number}};

export type ClientMessageType = ClientMessage["type"];

export type ServerMessage =
  | {type: "CARO:MATCH_FOUND", data: CaroMatch}
  | {type: "CARO:GAME_STATE", data: CaroMatch}
  | {type: "CARO:GAME_OVER", data: CaroMatch}
  | {type: "ERROR", data: {message: string}};
