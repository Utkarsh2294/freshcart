import { useEffect, useState } from "react";
import { Bell, Send } from "lucide-react";
import * as notificationService from "../services/notificationService";
import { useUiStore } from "../store/uiStore";

const options = [
  {
    key: "order_status",
    label: "Order updates",
    detail: "Delivery status and rider updates",
  },
  {
    key: "back_in_stock",
    label: "Back in stock",
    detail: "Restock alerts for saved items",
  },
  {
    key: "price_drop",
    label: "Price drops",
    detail: "Lower prices on products you follow",
  },
];

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [testing, setTesting] = useState(false);
  const [load, setLoad] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    notificationService
      .getPreferences()
      .then((data) => {
        if (active)
          setPrefs(
            data.preferences || {
              order_status: true,
              back_in_stock: true,
              price_drop: true,
            },
          );
      })
      .catch(() => {
        if (active) setError("Your notification settings could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [load]);
  const toggle = async (key) => {
    if (busy || !prefs) return;
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setBusy(true);
    setError("");
    try {
      await notificationService.updatePreferences(next);
    } catch {
      setPrefs(previous);
      setError(
        "That change could not be saved. Your previous setting has been restored.",
      );
    } finally {
      setBusy(false);
    }
  };
  const sendTest = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const result = await notificationService.sendTestNotification();
      useUiStore.getState().addToast({
        type: result.sent ? "success" : "info",
        message: result.sent
          ? "Test notification sent."
          : "No push notification was delivered. Enable notifications in this browser first.",
      });
    } catch {
      setError("The test notification could not be sent. Please try again.");
    } finally {
      setTesting(false);
    }
  };
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Bell className="mb-3 h-8 w-8 text-[#6366F1]" />
        <h1 className="text-3xl font-bold">Notification settings</h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          Choose the updates you want to receive.
        </p>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {error}{" "}
          {!prefs && (
            <button
              className="min-h-11 underline"
              onClick={() => setLoad((value) => value + 1)}
            >
              Try again
            </button>
          )}
        </p>
      )}
      {!prefs && !error && <p role="status">Loading settings…</p>}
      {prefs && (
        <section
          aria-label="Push notification preferences"
          className="divide-y divide-[var(--border-default)] overflow-hidden rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)]"
        >
          {options.map(({ key, label, detail }) => (
            <div
              key={key}
              className="flex items-start justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <h2 id={key} className="font-semibold">
                  {label}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {detail}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-labelledby={key}
                aria-checked={Boolean(prefs[key])}
                disabled={busy}
                onClick={() => toggle(key)}
                className="flex h-11 w-14 shrink-0 items-center disabled:opacity-60"
              >
                <span
                  className={`flex h-8 w-14 items-center rounded-full p-1 ${prefs[key] ? "bg-[#6366F1]" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <span
                    className="switch-thumb h-6 w-6 rounded-full bg-white shadow-sm"
                    style={{
                      transform: prefs[key]
                        ? "translateX(24px)"
                        : "translateX(0)",
                    }}
                  />
                </span>
              </button>
            </div>
          ))}
        </section>
      )}
      <button
        type="button"
        disabled={testing || !prefs}
        onClick={sendTest}
        className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {testing ? "Sending…" : "Send a test notification"}
      </button>
      <p className="text-sm text-[var(--text-secondary)]">
        Push delivery also needs notification permission and a subscription on
        this browser.
      </p>
    </div>
  );
}
