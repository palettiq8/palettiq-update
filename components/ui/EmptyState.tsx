import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`w-full h-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center flex-col gap-2 ${className}`}
    >
      <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full grid place-content-center shadow-inner text-zinc-500">
        <Icon size={40} />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 font-medium">{description}</p>
    </div>
  );
}
