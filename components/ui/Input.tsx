"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", type, ...props }, ref) => {
    const inputId = id ?? props.name;
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-900 dark:text-zinc-50"
          >
            {label}
          </label>
        )}

        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border px-3 h-9 text-sm font-medium text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-500
              outline-none transition-colors duration-150 bg-white dark:bg-zinc-950
              focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300
              ${isPassword ? "pr-9" : ""}
              ${error ? "border-red-300 focus:ring-red-300 focus:border-red-300" : "border-zinc-200 dark:border-zinc-700"}
              ${className}`}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs font-medium text-red-600 dark:text-red-500"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
