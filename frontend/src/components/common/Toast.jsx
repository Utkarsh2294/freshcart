import { useUiStore } from "../../store/uiStore";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Toast() {
  const toasts = useUiStore((state) => state.toasts);
  const removeToast = useUiStore((state) => state.removeToast);
  return (
    <div
      aria-label="Notifications"
      aria-live="polite"
      className="toast-stack fixed right-4 z-[300] flex w-[min(22rem,calc(100%-2rem))] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  const [closing, setClosing] = useState(false);
  const elementRef = useRef(null);
  const dismissalRef = useRef(null);
  const dismiss = useCallback(() => {
    if (dismissalRef.current) return;
    setClosing(true);
    dismissalRef.current = setTimeout(() => removeToast(toast.id), 160);
  }, [removeToast, toast.id]);

  useEffect(() => {
    const element = elementRef.current;
    let remaining = toast.duration || (toast.type === "error" ? 7000 : 4500);
    let started;
    let timer;
    let active = true;
    const pause = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = null;
      remaining -= Date.now() - started;
    };
    const resume = () => {
      if (
        !active ||
        timer ||
        document.hidden ||
        element.matches(":hover") ||
        element.contains(document.activeElement)
      )
        return;
      started = Date.now();
      timer = setTimeout(dismiss, Math.max(0, remaining));
    };
    const visibility = () => (document.hidden ? pause() : resume());
    const afterFocus = () => queueMicrotask(resume);
    element.addEventListener("pointerenter", pause);
    element.addEventListener("pointerleave", resume);
    element.addEventListener("focusin", pause);
    element.addEventListener("focusout", afterFocus);
    document.addEventListener("visibilitychange", visibility);
    resume();
    return () => {
      active = false;
      clearTimeout(timer);
      clearTimeout(dismissalRef.current);
      element.removeEventListener("pointerenter", pause);
      element.removeEventListener("pointerleave", resume);
      element.removeEventListener("focusin", pause);
      element.removeEventListener("focusout", afterFocus);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [dismiss, toast.duration, toast.type]);

  const variants = {
    success:
      "bg-green-50 text-green-900 border-green-200 dark:bg-green-950 dark:text-green-200",
    error:
      "bg-red-50 text-red-900 border-red-200 dark:bg-red-950 dark:text-red-200",
    info: "bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950 dark:text-blue-200",
  };
  return (
    <div
      ref={elementRef}
      role={toast.type === "error" ? "alert" : "status"}
      data-closing={closing}
      className={`toast-item flex items-start justify-between gap-3 rounded-2xl border p-3 shadow-lg ${variants[toast.type] || variants.info}`}
    >
      <p className="content-wrap min-w-0 self-center text-sm font-medium">
        {toast.message}
      </p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={dismiss}
        className="icon-button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
