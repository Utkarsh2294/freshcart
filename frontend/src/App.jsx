import { useEffect, useRef, useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./router";
import Toast from "./components/common/Toast";
import NotificationPrompt from "./components/common/NotificationPrompt";
import { useSocket } from "./hooks/useSocket";
import { useUiStore } from "./store/uiStore";
import { useAuth } from "./hooks/useAuth";
import { createGuestSession } from "./services/authService";
import { mergeGuestCart } from "./services/cartService";

const GUEST_KEY = "freshcart_guest_key";

export default function App() {
  const isDarkMode = useUiStore((state) => state.isDarkMode);
  const { user, token, login } = useAuth();
  const [sessionStatus, setSessionStatus] = useState("loading");
  const sessionStarted = useRef(false);

  useSocket();

  useEffect(() => {
    if (sessionStarted.current) return;
    sessionStarted.current = true;

    if (token && user?.role === "admin") {
      setSessionStatus("ready");
      return;
    }

    let guestKey = localStorage.getItem(GUEST_KEY);
    if (!guestKey) {
      guestKey = crypto.randomUUID();
      localStorage.setItem(GUEST_KEY, guestKey);
    }

    createGuestSession(guestKey)
      .then(async (data) => {
        login(data.user, data.accessToken || data.token);
        await mergeGuestCart();
        setSessionStatus("ready");
      })
      .catch(() => setSessionStatus("error"));
  }, [login, token, user?.role]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", isDarkMode ? "#08090C" : "#FFFFFF");
  }, [isDarkMode]);

  if (sessionStatus === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg-app)] text-[var(--text-secondary)]">
        Opening Freshcart...
      </div>
    );
  }

  if (sessionStatus === "error") {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--bg-app)] px-6 text-center text-[var(--text-primary)]">
        <div>
          <p className="mb-4">
            Freshcart could not start your shopping session.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[#6366F1] px-5 py-3 font-bold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toast />
      <NotificationPrompt />
    </>
  );
}
