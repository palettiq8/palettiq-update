"use client";

import { useToastStore } from "@/store/useToastStore";
import ToastItem from "@/components/global/ToastItem";
import type { ToastPosition } from "@/utils/types";

const positionClasses: Record<ToastPosition, string> = {
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-left": "top-4 left-4 items-start",
  "top-right": "top-4 right-4 items-end",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-right": "bottom-4 right-4 items-end",
};

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  const positions = Object.keys(positionClasses) as ToastPosition[];

  return (
    <>
      {positions.map((position) => {
        const toastsForPosition = toasts.filter((t) => t.position === position);
        if (toastsForPosition.length === 0) return null;

        return (
          <div
            key={position}
            className={`fixed z-9999 flex flex-col gap-2 ${positionClasses[position]}`}
          >
            {toastsForPosition.map((t) => (
              <ToastItem key={t.id} toast={t} />
            ))}
          </div>
        );
      })}
    </>
  );
}
