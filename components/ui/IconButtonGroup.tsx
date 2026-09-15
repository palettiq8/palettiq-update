"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconButtonGroupItem {
  icon: LucideIcon;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

type Size = "sm" | "md" | "lg";

interface IconButtonGroupProps {
  items: IconButtonGroupItem[];
  size?: Size;
  className?: string;
}

const containerSizeClasses: Record<Size, string> = {
  sm: "h-7",
  md: "h-9",
  lg: "h-11",
};

export default function IconButtonGroup({
  items,
  size = "md",
  className,
}: IconButtonGroupProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800",
        containerSizeClasses[size],
        className,
      )}
    >
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={item.onClick}
          disabled={item.disabled}
          aria-pressed={item.active}
          aria-label={item["aria-label"]}
          className={cn(
            "flex h-full aspect-square items-center justify-center rounded-md transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50",
            item.active
              ? "bg-zinc-200/70 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100",
          )}
        >
          <item.icon size={16} />
        </button>
      ))}
    </div>
  );
}
