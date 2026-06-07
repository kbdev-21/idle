import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { auth } from "@/core/auth.ts";

type AuthState = {
  session: Session | null;
  init: () => () => void;
};

let unsubscribe: (() => void) | null = null;
let isSigningIn = false;

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  init: () => {
    // (1) idempotent: nếu đã init rồi thì tái sử dụng subscription cũ
    if (unsubscribe) {
      return unsubscribe;
    }

    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      set({ session });

      // (2)(3) chỉ signIn khi thật sự chưa có session và không có request nào đang chạy
      if (!session && !isSigningIn) {
        isSigningIn = true;
        try {
          await auth.signInAnonymously();
        } finally {
          isSigningIn = false;
        }
      }
    });

    unsubscribe = () => {
      subscription.unsubscribe();
      unsubscribe = null;
    };
    return unsubscribe;
  },
}));
