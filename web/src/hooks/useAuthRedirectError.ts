import { useEffect } from "react";
import { toast } from "sonner";

import { consumeAuthRedirectError } from "@/core/auth-redirect.ts";

// Mount glue: đọc lỗi redirect từ URL (pure ở core) rồi hiển thị toast. Gọi 1 lần ở App.
export function useAuthRedirectError() {
  useEffect(() => {
    const message = consumeAuthRedirectError();
    if (message) {
      toast.error(message);
    }
  }, []);
}
