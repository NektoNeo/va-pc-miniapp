import * as React from "react";
import { cn } from "../lib/utils";

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * FloatingInput Component - Modern 2025 Design
 *
 * Floating label input with VA-PC glassmorphism theme
 * Label floats up when input is focused or has value
 *
 * @example
 * ```tsx
 * <FloatingInput
 *   label="Название сборки"
 *   placeholder="Игровой ПК"
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */
const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, type = "text", placeholder = " ", ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            // Base styles
            "peer h-12 w-full rounded-lg border bg-white/5 px-4 pt-5 pb-1",
            "text-white placeholder-transparent",
            "backdrop-blur-lg transition-all duration-200",

            // Border styles
            "border-[#9D4EDD]/20",
            "focus:border-[#9D4EDD]/40",
            "focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20",

            // Error state
            error && "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20",

            // Disabled state
            "disabled:opacity-50 disabled:cursor-not-allowed",

            className
          )}
          placeholder={placeholder}
          ref={ref}
          {...props}
        />

        {/* Floating Label */}
        <label
          className={cn(
            // Base positioning
            "absolute left-4 top-1/2 -translate-y-1/2",
            "text-white/60 text-sm",
            "pointer-events-none",
            "transition-all duration-200",

            // Floating state (when focused or has value)
            "peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#9D4EDD]",
            "peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs",

            // Error state
            error && "peer-focus:text-red-400"
          )}
        >
          {label}
        </label>

        {/* Error Message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-400 animate-fade-in-up">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
