import { useToastStore } from "@/store/useToastStore";
import type { ToastType, ToastPosition } from "@/utils/types";

interface ToastOptions {
  position?: ToastPosition;
  duration?: number;
}

const showToast = (
  message: string,
  type: ToastType,
  options?: ToastOptions,
) => {
  const id = crypto.randomUUID();

  useToastStore.getState().addToast({
    id,
    message,
    type,
    position: options?.position ?? "bottom-center",
    duration: options?.duration ?? 3000,
  });
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    showToast(message, "success", options),
  error: (message: string, options?: ToastOptions) =>
    showToast(message, "error", options),
  warning: (message: string, options?: ToastOptions) =>
    showToast(message, "warning", options),
};
