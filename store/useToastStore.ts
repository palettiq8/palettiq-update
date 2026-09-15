import { create } from "zustand";
import type { Toast } from "@/utils/types";

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
