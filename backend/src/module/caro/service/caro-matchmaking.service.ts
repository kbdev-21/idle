import {type CaroMatch, createCaroMatch, isUserInACaroMatch} from "./caro-matches-management.service.js";

const caroQueuePlayers = new Set<string>();

// false = không vào queue được, null = đang chờ, CaroMatch = đã ghép cặp + tạo phòng
export async function joinCaroQueue(userId: string): Promise<CaroMatch | null | false> {
  if(caroQueuePlayers.has(userId)) return false;
  if(isUserInACaroMatch(userId)) return false;

  caroQueuePlayers.add(userId);
  if(caroQueuePlayers.size < 2) return null;

  // Set giữ thứ tự insert → ghép 2 người vào queue sớm nhất
  const [playerA, playerB] = caroQueuePlayers;
  caroQueuePlayers.delete(playerA);
  caroQueuePlayers.delete(playerB);
  return await createCaroMatch(playerA, playerB);
}

export function leftCaroQueue(userId: string) {
  caroQueuePlayers.delete(userId);
}
