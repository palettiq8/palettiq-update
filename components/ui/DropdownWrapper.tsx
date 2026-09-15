"use client";

import {
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
  cloneElement,
  isValidElement,
} from "react";
import { createPortal } from "react-dom";

interface Coords {
  top: number;
  left: number;
  vPosition: "top" | "bottom";
  hPosition: "left" | "right";
}

function computeCoords(
  triggerRect: DOMRect,
  contentWidth: number,
  contentHeight: number,
): Coords {
  const spaceBelow = window.innerHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  const vPosition: "top" | "bottom" =
    spaceBelow < contentHeight && spaceAbove > spaceBelow ? "top" : "bottom";

  const spaceRight = window.innerWidth - triggerRect.left;
  const hPosition: "left" | "right" =
    spaceRight < contentWidth ? "right" : "left";

  const top =
    vPosition === "bottom"
      ? triggerRect.bottom + 4
      : triggerRect.top - contentHeight - 4;
  const left =
    hPosition === "left" ? triggerRect.left : triggerRect.right - contentWidth;

  return { top, left, vPosition, hPosition };
}

function getTransform(coords: Coords | null, ready: boolean) {
  if (!ready || !coords) {
    const y =
      coords?.vPosition === "top" ? "translateY(4px)" : "translateY(-4px)";
    return `scale(0.95) ${y}`;
  }
  return "scale(1) translateY(0px)";
}

interface DropdownWrapperProps {
  trigger: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function DropdownWrapper({
  trigger,
  children,
  className,
}: DropdownWrapperProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [ready, setReady] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const recalculate = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentWidth = contentRef.current?.offsetWidth ?? 0;
    const contentHeight = contentRef.current?.offsetHeight ?? 0;
    setCoords(computeCoords(triggerRect, contentWidth, contentHeight));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      setReady(false);
      return;
    }
    recalculate();
    window.addEventListener("resize", recalculate);
    window.addEventListener("scroll", recalculate, true);
    return () => {
      window.removeEventListener("resize", recalculate);
      window.removeEventListener("scroll", recalculate, true);
    };
  }, [open, recalculate]);

  useLayoutEffect(() => {
    if (coords) {
      const id = requestAnimationFrame(() => setReady(true));
      return () => cancelAnimationFrame(id);
    }
  }, [coords]);

  useLayoutEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="inline-block" ref={triggerRef}>
      <div onClick={() => setOpen((prev) => !prev)}>
        {isValidElement(trigger)
          ? cloneElement(trigger as React.ReactElement<any>, {
              "data-state": open ? "open" : "closed",
              "aria-expanded": open,
            })
          : trigger}
      </div>

      {open &&
        createPortal(
          <div
            ref={contentRef}
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              visibility: coords ? "visible" : "hidden",
              opacity: ready ? 1 : 0,
              transform: getTransform(coords, ready),
              transition: "opacity 150ms ease-out, transform 150ms ease-out",
            }}
            className={`z-50 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 shadow-md ${className ?? ""}`}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}
