import { randomXtoY } from "../../core/utils.js";
import { newCaroGame, playCaroTurn } from "./caro.engine.js";
import { applyMatchResult, getRatingsByUserIds } from "./caro-stat.service.js";
const rooms = new Map();
const userRoom = new Map();
export function getRoomById(roomId) {
    return rooms.get(roomId);
}
export function getRoomByUserId(userId) {
    const roomId = userRoom.get(userId);
    if (!roomId)
        return undefined;
    return rooms.get(roomId);
}
export function isUserPlaying(userId) {
    return userRoom.has(userId);
}
export function getSideOf(room, userId) {
    return room.xPlayerId === userId ? "X" : "O";
}
export async function createRoom(playerA, playerB) {
    const [playerX, playerO] = randomXtoY(0, 1) === 0 ? [playerA, playerB] : [playerB, playerA];
    const ratings = await getRatingsByUserIds([playerX, playerO]);
    const room = {
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
export async function playTurn(userId, x, y) {
    const room = getRoomByUserId(userId);
    if (!room)
        return false;
    const newState = playCaroTurn(room.state, getSideOf(room, userId), x, y);
    if (!newState)
        return false;
    room.state = newState;
    if (newState.status !== "playing") {
        const { xNewRating, oNewRating } = await applyMatchResult(room.xPlayerId, room.oPlayerId, newState.winner);
        room.xRatingAfter = xNewRating;
        room.oRatingAfter = oNewRating;
        closeRoom(room);
    }
    return room;
}
function closeRoom(room) {
    rooms.delete(room.id);
    userRoom.delete(room.xPlayerId);
    userRoom.delete(room.oPlayerId);
}
