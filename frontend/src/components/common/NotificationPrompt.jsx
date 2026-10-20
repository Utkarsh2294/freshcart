import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Button from "./Button";
import { useAuth } from "../../hooks/useAuth";
import { useUiStore } from "../../store/uiStore";
import { featureFlags } from "../../utils/featureFlags";
import { enablePushNotifications } from "../../services/notificationService";

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const { isAuthenticated } = useAuth();
  const { addToast } = useUiStore();

  useEffect(() => {
    if (
      featureFlags.pushNotificationsPwa &&
      import.meta.env.VITE_VAPID_PUBLIC_KEY &&
      isAuthenticated &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      const timer = setTimeout(() => setShow(true), 10000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const enable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await enablePushNotifications();
      addToast({ type: "success", message: "Push notifications enabled." });
    } catch (error) {
      addToast({ type: "error", message: error.message });
    } finally {
      setShow(false);
      setBusy(false);
    }
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Enable push notifications"
      className="notification-prompt fixed left-4 right-4 z-50 bg-white dark:bg-[#1A1C24] p-5 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800/50 max-w-sm flex gap-4"
    >
      <div className="bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white p-3 rounded-2xl h-fit shadow-lg shadow-[#8B5CF6]/20">
        <Bell className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white">
          Enable Notifications
        </h4>
        <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
          Get real-time updates on your order status and exclusive offers.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 py-2 text-xs"
            onClick={() => setShow(false)}
          >
            Not Now
          </Button>
          <Button
            disabled={busy}
            className="flex-1 py-2 text-xs"
            onClick={enable}
          >
            {busy ? "Enabling…" : "Enable"}
          </Button>
        </div>
      </div>
    </div>
  );
}
