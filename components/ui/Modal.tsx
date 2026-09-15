"use client";

import { ReactNode, useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      let inner: number;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    } else {
      setVisible(false);
      const timeout = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 transition-all duration-200 ease-out shadow-lg ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-2"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
