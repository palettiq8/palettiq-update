import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";
import { IconType } from "react-icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400",
        secondary:
          "bg-violet-600 text-white hover:bg-violet-500 dark:bg-violet-500 dark:hover:bg-violet-400",
        outline:
          "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-700/70",
        ghost:
          "bg-transparent text-zinc-900 hover:bg-zinc-200/50 dark:text-zinc-100 dark:hover:bg-zinc-700/70",
        destructive:
          "bg-transparent text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/70",
      },
      size: {
        sm: "h-7 px-2 text-sm gap-1.5",
        md: "h-9 px-3 text-sm gap-1.5",
        lg: "h-11 px-3 text-base gap-1.5",
      },
      iconOnly: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      { iconOnly: true, size: "sm", className: "h-7 w-7 p-0 gap-0" },
      { iconOnly: true, size: "md", className: "h-9 w-9 p-0 gap-0" },
      { iconOnly: true, size: "lg", className: "h-11 w-11 p-0 gap-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconOnly: false,
    },
  },
);

export interface ButtonProps
  extends
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title">,
  Omit<VariantProps<typeof buttonVariants>, "iconOnly"> {
  title?: string;
  icon?: IconType;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      title,
      icon: Icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isIconOnly = Boolean(Icon) && !title;

    const spinner = (
      <Spinner size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} />
    );
    const iconEl = loading ? spinner : Icon && <Icon size={16} />;
    const titleEl = !isIconOnly && title && <span>{title}</span>;

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={disabled || loading}
        aria-label={isIconOnly ? (props["aria-label"] ?? title) : undefined}
        className={cn(
          buttonVariants({ variant, size, iconOnly: isIconOnly }),
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isIconOnly ? (
          iconEl
        ) : iconPosition === "right" ? (
          <>
            {titleEl}
            {iconEl}
          </>
        ) : (
          <>
            {iconEl}
            {titleEl}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
