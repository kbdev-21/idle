import { create } from "zustand";
import { realtime } from "@/core/websocket.ts";

type MatchmakingState = {
  findingMatch: boolean;
  start: () => void;
  cancel: () => void;
};

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  findingMatch: false,
  start: () => {
    // send thất bại (socket chưa sẵn sàng) -> không vào trạng thái tìm trận
    if (!realtime.send({ type: "CARO:MATCHMAKING" })) return;
    set({ findingMatch: true });
  },
  cancel: () => {
    realtime.send({ type: "CARO:CANCEL_MATCHMAKING" });
    set({ findingMatch: false });
  },
}));
