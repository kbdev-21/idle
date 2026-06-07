import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner.tsx";
import { useAuthStore } from "@/stores/auth.store.ts";
import HomePage from "@/pages/home/HomePage.tsx";

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    const cleanup = init();
    return cleanup;
  }, [init]);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const errorCode = hashParams.get("error_code") ?? queryParams.get("error_code");
    const errorDescription =
      hashParams.get("error_description") ?? queryParams.get("error_description");

    if (!errorCode && !errorDescription) {
      return;
    }

    if (errorCode === "identity_already_exists") {
      toast.error("This Google account is already used. Sign in instead.");
    } else if (errorDescription) {
      toast.error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
    }

    // clean the error params out of the URL
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster />
    </>
  );
}
