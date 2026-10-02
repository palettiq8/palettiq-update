import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProjectState {
  isModalOpen: boolean;
  setIsModalOpen: (val?: boolean) => void;
}

export const useProjectState = create<ProjectState>()(
  persist(
    (set) => ({
      isModalOpen: false,
      setIsModalOpen: (val) =>
        set((state) => ({
          isModalOpen: typeof val === "boolean" ? val : !state.isModalOpen,
        })),
    }),
    {
      name: "project-state",
      partialize: () => ({}),
    },
  ),
);
