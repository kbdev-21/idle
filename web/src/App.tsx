import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { Toaster } from "@/components/ui/sonner.tsx";
import { useAuthStore } from "@/stores/auth.store.ts";
import { useCaroStore } from "@/stores/caro.store.ts";
import { useAuthRedirectError } from "@/hooks/useAuthRedirectError.ts";
import { useRealtimeListener } from "@/hooks/useRealtimeListener.ts";
import PageLayout from "@/components/layout/PageLayout.tsx";
import HomePage from "@/pages/home/HomePage.tsx";
import CaroLobbyPage from "@/pages/caro/CaroLobbyPage.tsx";
import CaroGamePage from "@/pages/caro-game/CaroGamePage.tsx";

// Không trong game mà vào /caro/game -> đẩy về lobby.
// (persist rehydrate đồng bộ nên F5 giữa game không bị đẩy nhầm)
function RequireGame({ children }: { children: ReactNode }) {
  const room = useCaroStore((s) => s.room);
  if (!room) return <Navigate to="/caro" replace />;
  return children;
}

// Đang chơi dở (room persist, status playing) -> mọi lần mount app đều vào trang game.
// Game đã kết thúc thì không ép quay lại (xem kết quả xong rời bình thường).
function useResumeCaroGame() {
  const navigate = useNavigate();
  useEffect(() => {
    if (useCaroStore.getState().room?.state.status === "playing") {
      navigate("/caro/play", { replace: true });
    }
  }, [navigate]);
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useRealtimeListener();
  useAuthRedirectError();
  useResumeCaroGame();

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  return (
    <>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/caro" element={<CaroLobbyPage />} />
          <Route
            path="/caro/play"
            element={
              <RequireGame>
                <CaroGamePage />
              </RequireGame>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
