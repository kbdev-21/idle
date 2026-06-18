import {db} from "../../../database/db.js";
import {userCaroStats} from "../../../database/schema.js";
import {eq, inArray, sql} from "drizzle-orm";
import type {CaroSide} from "../game-engine/caro.engine.js";

export async function getRatingsByUserIds(userIds: string[]): Promise<Map<string, number>> {
  const stats = await db.select({
    userId: userCaroStats.userId,
    rating: userCaroStats.rating
  }).from(userCaroStats).where(inArray(userCaroStats.userId, userIds));

  return new Map(stats.map(s => [s.userId, s.rating]));
}

export async function applyMatchResult(xPlayerId: string, oPlayerId: string, winner: CaroSide | null): Promise<{
  xNewRating: number;
  oNewRating: number;
}> {
  const stats = await db.select({
    userId: userCaroStats.userId,
    rating: userCaroStats.rating
  }).from(userCaroStats).where(inArray(userCaroStats.userId, [xPlayerId, oPlayerId]));

  const xRating = stats.find(s => s.userId === xPlayerId)?.rating;
  const oRating = stats.find(s => s.userId === oPlayerId)?.rating;
  if(xRating === undefined || oRating === undefined) {
    return {xNewRating: xRating ?? 0, oNewRating: oRating ?? 0};
  }

  if(winner === null) {
    const xChange = calculateRatingChange(xRating, oRating, "draw");
    const oChange = calculateRatingChange(oRating, xRating, "draw");

    await db.transaction(async tx => {
      await tx.update(userCaroStats).set({
        matches: sql`${userCaroStats.matches} + 1`,
        draws: sql`${userCaroStats.draws} + 1`,
        rating: sql`${userCaroStats.rating} + ${xChange}`
      }).where(eq(userCaroStats.userId, xPlayerId));

      await tx.update(userCaroStats).set({
        matches: sql`${userCaroStats.matches} + 1`,
        draws: sql`${userCaroStats.draws} + 1`,
        rating: sql`${userCaroStats.rating} + ${oChange}`
      }).where(eq(userCaroStats.userId, oPlayerId));
    });

    return {xNewRating: xRating + xChange, oNewRating: oRating + oChange};
  }

  const winnerId = winner === "X" ? xPlayerId : oPlayerId;
  const loserId = winner === "X" ? oPlayerId : xPlayerId;
  const winnerRating = winner === "X" ? xRating : oRating;
  const loserRating = winner === "X" ? oRating : xRating;
  const winnerChange = calculateRatingChange(winnerRating, loserRating, "win");
  const loserChange = calculateRatingChange(loserRating, winnerRating, "lose");

  await db.transaction(async tx => {
    await tx.update(userCaroStats).set({
      matches: sql`${userCaroStats.matches} + 1`,
      wins: sql`${userCaroStats.wins} + 1`,
      rating: sql`${userCaroStats.rating} + ${winnerChange}`
    }).where(eq(userCaroStats.userId, winnerId));

    await tx.update(userCaroStats).set({
      matches: sql`${userCaroStats.matches} + 1`,
      losses: sql`${userCaroStats.losses} + 1`,
      rating: sql`${userCaroStats.rating} + ${loserChange}`
    }).where(eq(userCaroStats.userId, loserId));
  });

  const xChange = winner === "X" ? winnerChange : loserChange;
  const oChange = winner === "X" ? loserChange : winnerChange;
  return {xNewRating: xRating + xChange, oNewRating: oRating + oChange};
}

function calculateRatingChange(playerRating: number, opponentRating: number, result: "win" | "draw" | "lose"): number {
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // -1 khi đối thủ chỉ bằng 50% rating, 0 khi ngang nhau, +1 khi đối thủ mạnh gấp đôi
  const diff = clamp(Math.log2(opponentRating / playerRating), -1, 1);

  switch(result) {
    case "win":
      return Math.round(10 + diff * 5);
    case "lose":
      return -Math.round(10 - diff * 5);
    case "draw":
      return Math.round(diff * 3);
  }
}