"use client";

import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalDropdownProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}

export default function PortalDropdown({
  isOpen,
  anchorRef,
  children,
  className = "",
}: PortalDropdownProps) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, anchorRef]);

  if (!mounted || !isOpen || !position) return null;

  return createPortal(
    <div
      data-portal-dropdown="true"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
      className={className}
    >
      {children}
    </div>,
    document.body,
  );
}
