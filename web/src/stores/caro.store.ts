import { create } from "zustand";
import { persist } from "zustand/middleware";
import { realtime } from "@/core/websocket.ts";
import type { CaroMatchWsPayload } from "@/core/caro-types.ts";

type CaroState = {
  match: CaroMatchWsPayload | null;
  playTurn: (x: number, y: number) => void;
  leaveMatch: () => void;
};

// match được set từ useRealtimeListener (MATCH_FOUND / GAME_STATE / GAME_OVER).
// persist localStorage -> F5 hiện board ngay; server gửi GAME_STATE lúc connect để sửa stale.
export const useCaroStore = create<CaroState>()(
  persist(
    (set) => ({
      match: null,
      playTurn: (x, y) => {
        realtime.send({ type: "CARO:PLAY_TURN", data: { x, y } });
      },
      // Leave mềm: chỉ rời UI client-side, match vẫn còn server-side (resume khi quay lại)
      leaveMatch: () => {
        set({ match: null });
      },
    }),
    { name: "caro-match" }
  )
);
