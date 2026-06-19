import axiosInstance from "@/api/axios-instance.ts";
import type { User } from "@/api/user/api.ts";
import type { CaroGameState } from "@/core/caro-types.ts";

export async function findCaroMatches(params: FindCaroMatchesParams): Promise<CaroMatchSummary[]> {
  const res = await axiosInstance.get<CaroMatchSummary[]>("/api/caro-matches", { params });
  return res.data;
}

export async function getCaroMatchById(matchId: string): Promise<CaroMatchDetail> {
  const res = await axiosInstance.get<CaroMatchDetail>(`/api/caro-matches/${matchId}`);
  return res.data;
}

// Mirror backend: module/caro/service/caro-match.service.ts (CaroMatchDbSummary / CaroMatchDbDetail)
export type CaroMatchSummary = {
  id: string;
  xPlayerId: string;
  xRating: number;
  xNewRating: number | null;
  oPlayerId: string;
  oRating: number;
  oNewRating: number | null;
  winnerId: string | null;
  createdAt: string;
  xPlayer: User;
  oPlayer: User;
};

// Detail kèm states (full history) để replay; summary thì không có.
export type CaroMatchDetail = CaroMatchSummary & {
  states: CaroGameState[];
};

export type FindCaroMatchesParams = {
  userId: string;
  offset?: number;
  limit?: number;
};
