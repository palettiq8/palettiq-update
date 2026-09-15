import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

interface GlobalState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "global-store",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
