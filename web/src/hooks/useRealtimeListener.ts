import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { realtime } from "@/core/websocket.ts";
import { useMatchmakingStore } from "@/stores/matchmaking.store.ts";
import { useCaroStore } from "@/stores/caro.store.ts";

// Điểm DUY NHẤT nhận ServerMessage và route vào store / điều hướng.
// Gọi 1 lần ở App (bên trong Router) -> dùng được useNavigate, cleanup theo lifecycle.
// Thêm feature mới -> thêm case ở đây, store vẫn thuần state + actions.
export function useRealtimeListener() {
  const navigate = useNavigate();

  useEffect(() => {
    return realtime.subscribe((msg) => {
      switch (msg.type) {
        case "CARO:MATCH_FOUND":
          useMatchmakingStore.setState({ findingMatch: false });
          useCaroStore.setState({ match: msg.data });
          navigate("/caro/play");
          break;
        case "CARO:GAME_STATE":
          // nước đi mới hoặc resume lúc connect
          useCaroStore.setState({ match: msg.data });
          break;
        case "CARO:GAME_OVER":
          // giữ board cuối để hiện kết quả
          useCaroStore.setState({ match: msg.data });
          break;
        case "ERROR":
          useMatchmakingStore.setState({ findingMatch: false });
          break;
      }
    });
  }, [navigate]);
}
