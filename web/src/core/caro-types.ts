// Mirror backend: module/caro/caro.engine.ts + caro-room.service.ts
export type CaroSide = "X" | "O";

export type CaroSquare = CaroSide | null;

export type CaroGameStatus = "playing" | "won" | "draw";

export type CaroGameState = {
  board: CaroSquare[][];
  turn: number;
  turnOf: CaroSide;
  status: CaroGameStatus;
  winner: CaroSide | null;
};

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
