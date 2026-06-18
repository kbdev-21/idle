// Map các error_code đã biết từ Supabase OAuth redirect → message thân thiện.
const AUTH_REDIRECT_MESSAGES: Record<string, string> = {
  identity_already_exists: "This Google account is already used. Sign in instead.",
};

// Đọc error params từ URL (hash hoặc query), trả message rồi dọn sạch URL.
function readAuthRedirectErrorFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);

  const errorCode = hashParams.get("error_code") ?? queryParams.get("error_code");
  const errorDescription =
    hashParams.get("error_description") ?? queryParams.get("error_description");

  if (!errorCode && !errorDescription) {
    return null;
  }

  let message: string | null = null;
  if (errorCode && AUTH_REDIRECT_MESSAGES[errorCode]) {
    message = AUTH_REDIRECT_MESSAGES[errorCode];
  } else if (errorDescription) {
    message = decodeURIComponent(errorDescription.replace(/\+/g, " "));
  }

  // clean the error params out of the URL
  window.history.replaceState(null, "", window.location.pathname);

  return message;
}

// Bắt error NGAY lúc module load (trước khi React render → trước khi <Navigate> ở
// trang con kịp replaceState xoá mất params). Nhờ vậy dù redirect về trang nào,
// rồi app tự navigate đi đâu, message vẫn được giữ lại để hiển thị.
const capturedMessage = readAuthRedirectErrorFromUrl();
let consumed = false;

// Gọi 1 lần lúc app load — vừa đọc vừa "consume" nên gọi lại sẽ trả null.
export function consumeAuthRedirectError(): string | null {
  if (consumed) {
    return null;
  }
  consumed = true;
  return capturedMessage;
}
