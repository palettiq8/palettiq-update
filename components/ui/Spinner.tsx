import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-4.5 w-4.5",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends
    React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        className={cn(spinnerVariants({ size }), className)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle
          className="opacity-40"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
