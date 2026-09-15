"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";
import type { Toast, ToastPosition } from "@/utils/types";

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
};

const iconColorMap = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
};

const animationMap: Record<ToastPosition, string> = {
  "top-center": "animate-slide-in-top",
  "bottom-center": "animate-slide-in-bottom",
  "top-left": "animate-slide-in-left",
  "bottom-left": "animate-slide-in-left",
  "top-right": "animate-slide-in-right",
  "bottom-right": "animate-slide-in-right",
};

export default function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={`flex items-center justify-between gap-3 min-w-50 max-w-96 rounded-lg p-3 shadow-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-900
        ${animationMap[toast.position]}`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className={`shrink-0 ${iconColorMap[toast.type]}`} />
        <p className="text-sm font-normal">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity hover:cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
