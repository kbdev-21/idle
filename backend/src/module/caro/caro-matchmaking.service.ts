import {type CaroRoom, createRoom, isUserPlaying} from "./caro-room.service.js";

const caroQueuePlayers = new Set<string>();

// false = không vào queue được, null = đang chờ, CaroRoom = đã ghép cặp + tạo phòng
export function joinCaroQueue(userId: string): CaroRoom | null | false {
  if(caroQueuePlayers.has(userId)) return false;
  if(isUserPlaying(userId)) return false;

  caroQueuePlayers.add(userId);
  if(caroQueuePlayers.size < 2) return null;

  // Set giữ thứ tự insert → ghép 2 người vào queue sớm nhất
  const [playerA, playerB] = caroQueuePlayers;
  caroQueuePlayers.delete(playerA);
  caroQueuePlayers.delete(playerB);
  return createRoom(playerA, playerB);
}

export function leftCaroQueue(userId: string) {
  caroQueuePlayers.delete(userId);
}
