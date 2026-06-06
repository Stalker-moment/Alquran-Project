"use client";

import React, { useEffect, useRef } from "react";
import { Toast, useToast } from "@/context/ToastContext";
import {
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaInfoCircle, FaTimes
} from "react-icons/fa";

const ICONS = {
  success: <FaCheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />,
  error:   <FaTimesCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />,
  warning: <FaExclamationTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0" />,
  info:    <FaInfoCircle className="h-4.5 w-4.5 text-blue-400 shrink-0" />,
};

const COLORS = {
  success: "border-emerald-500/30 bg-emerald-500/10 shadow-emerald-500/10",
  error:   "border-red-500/30 bg-red-500/10 shadow-red-500/10",
  warning: "border-amber-500/30 bg-amber-500/10 shadow-amber-500/10",
  info:    "border-blue-500/30 bg-blue-500/10 shadow-blue-500/10",
};

const TITLE_COLORS = {
  success: "text-emerald-300",
  error:   "text-red-300",
  warning: "text-amber-300",
  info:    "text-blue-300",
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Slide-in animation
    el.style.opacity = "0";
    el.style.transform = "translateX(100%)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.35s ease, transform 0.35s cubic-bezier(.22,.61,.36,1)";
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    });
  }, []);

  const handleClose = () => {
    const el = ref.current;
    if (el) {
      el.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      el.style.opacity = "0";
      el.style.transform = "translateX(110%)";
      setTimeout(() => removeToast(toast.id), 250);
    } else {
      removeToast(toast.id);
    }
  };

  return (
    <div
      ref={ref}
      role="alert"
      aria-live="assertive"
      className={`relative flex items-start gap-3 rounded-2xl border ${COLORS[toast.type]} backdrop-blur-md bg-card-bg/80 px-4 py-3.5 shadow-lg max-w-sm w-full`}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full overflow-hidden">
        <div
          className={`h-full animate-toast-shrink ${
            toast.type === "success" ? "bg-emerald-500" :
            toast.type === "error"   ? "bg-red-500" :
            toast.type === "warning" ? "bg-amber-500" :
            "bg-blue-500"
          }`}
        />
      </div>

      {ICONS[toast.type]}

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`text-xs font-extrabold tracking-wide uppercase mb-0.5 ${TITLE_COLORS[toast.type]}`}>
            {toast.title}
          </p>
        )}
        <p className="text-xs text-foreground/90 leading-relaxed font-medium">
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="text-muted hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-card-border/50 shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        <FaTimes className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
