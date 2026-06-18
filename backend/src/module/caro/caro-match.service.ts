import {randomXtoY} from "../../core/utils.js";
import {type CaroGameState, type CaroSide, type CaroSquare, newCaroGame, playCaroTurn} from "./caro.engine.js";
import {applyMatchResult, getRatingsByUserIds} from "./caro-stat.service.js";

const TURN_TIME_LIMIT_MS = 20_000;

export type CaroMatch = {
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

const matches = new Map<string, CaroMatch>();
const userMatch = new Map<string, string>();

export function getCaroMatchById(matchId: string): CaroMatch | undefined {
  return matches.get(matchId);
}

export function getCaroMatchByUserId(userId: string): CaroMatch | undefined {
  const matchId = userMatch.get(userId);
  if(!matchId) return undefined;
  return matches.get(matchId);
}

export function isUserInACaroMatch(userId: string): boolean {
  return userMatch.has(userId);
}

export async function createCaroMatch(playerA: string, playerB: string): Promise<CaroMatch> {
  const [playerX, playerO] = randomXtoY(0, 1) === 0 ? [playerA, playerB] : [playerB, playerA];

  const ratings = await getRatingsByUserIds([playerX, playerO]);

  const match: CaroMatch = {
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
  matches.set(match.id, match);
  userMatch.set(playerA, match.id);
  userMatch.set(playerB, match.id);
  return match;
}

export async function makeCaroMove(userId: string, x: number, y: number): Promise<CaroMatch | false> {
  const match = getCaroMatchByUserId(userId);
  if(!match) return false;
  return applyMove(match, getSideOf(match, userId), x, y);
}

// Quét match quá hạn lượt -> đánh random ô trống cho người hết giờ. Trả về các match bị ảnh hưởng để broadcast.
export async function processTimeoutsForCurrentCaroMatches(now: number): Promise<CaroMatch[]> {
  const timedOut: CaroMatch[] = [];
  for(const match of matches.values()) {
    if(match.state.status === "playing" && now - match.lastMoveAt >= TURN_TIME_LIMIT_MS) timedOut.push(match);
  }

  const affected: CaroMatch[] = [];
  for(const match of timedOut) {
    if(match.state.status !== "playing") continue; // re-check sau await
    if(now - match.lastMoveAt < TURN_TIME_LIMIT_MS) continue; // re-check: có move trong lúc await
    const move = pickRandomEmptyCell(match.state.board);
    if(!move) continue;
    const updated = await applyMove(match, match.state.turnOf, move.x, move.y);
    if(updated) affected.push(updated);
  }
  return affected;
}

async function applyMove(match: CaroMatch, side: CaroSide, x: number, y: number): Promise<CaroMatch | false> {
  const newState = playCaroTurn(match.state, side, x, y);
  if(!newState) return false;

  match.state = newState;
  match.lastMoveAt = Date.now(); // sync, set TRƯỚC mọi await
  if(newState.status !== "playing") {
    const {xNewRating, oNewRating} = await applyMatchResult(match.xPlayerId, match.oPlayerId, newState.winner);
    match.xRatingAfter = xNewRating;
    match.oRatingAfter = oNewRating;
    closeMatch(match);
  }
  return match;
}

function getSideOf(match: CaroMatch, userId: string): CaroSide {
  return match.xPlayerId === userId ? "X" : "O";
}

function pickRandomEmptyCell(board: CaroSquare[][]): {x: number; y: number} | null {
  const empties: {x: number; y: number}[] = [];
  for(let x = 0; x < board.length; x++) for(let y = 0; y < board[x].length; y++) if(board[x][y] === null) empties.push({x, y});
  if(empties.length === 0) return null;
  return empties[randomXtoY(0, empties.length - 1)];
}


function closeMatch(match: CaroMatch) {
  matches.delete(match.id);
  userMatch.delete(match.xPlayerId);
  userMatch.delete(match.oPlayerId);
}
