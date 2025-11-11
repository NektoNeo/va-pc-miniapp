import * as React from "react";
import { cn } from "../lib/utils";

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

/**
 * FloatingTextarea Component - Modern 2025 Design
 *
 * Floating label textarea with VA-PC glassmorphism theme
 * Label floats up when textarea is focused or has value
 *
 * @example
 * ```tsx
 * <FloatingTextarea
 *   label="Описание"
 *   placeholder="Введите описание сборки..."
 *   value={value}
 *   onChange={handleChange}
 * />
 * ```
 */
const FloatingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(({ className, label, error, placeholder = " ", ...props }, ref) => {
  return (
    <div className="relative">
      <textarea
        className={cn(
          // Base styles
          "peer min-h-[100px] w-full rounded-lg border bg-white/5 px-4 pt-6 pb-2",
          "text-white placeholder-transparent resize-y",
          "backdrop-blur-lg transition-all duration-200",

          // Border styles
          "border-[#9D4EDD]/20",
          "focus:border-[#9D4EDD]/40",
          "focus:outline-none focus:ring-2 focus:ring-[#9D4EDD]/20",

          // Error state
          error &&
            "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20",

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
          // Base positioning - higher for textarea
          "absolute left-4 top-4",
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
});

FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingTextarea };
