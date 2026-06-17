import { create } from "zustand";
import { persist } from "zustand/middleware";
import { realtime } from "@/core/websocket.ts";
import type { CaroRoom } from "@/core/caro-types.ts";

type CaroState = {
  room: CaroRoom | null;
  playTurn: (x: number, y: number) => void;
  leaveRoom: () => void;
};

// room được set từ useRealtimeListener (MATCH_FOUND / GAME_STATE / GAME_OVER).
// persist localStorage -> F5 hiện board ngay; server gửi GAME_STATE lúc connect để sửa stale.
export const useCaroStore = create<CaroState>()(
  persist(
    (set) => ({
      room: null,
      playTurn: (x, y) => {
        realtime.send({ type: "CARO:PLAY_TURN", data: { x, y } });
      },
      // Leave mềm: chỉ rời UI client-side, room vẫn còn server-side (resume khi quay lại)
      leaveRoom: () => {
        set({ room: null });
      },
    }),
    { name: "caro-room" }
  )
);
