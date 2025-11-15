"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../lib/utils";

/**
 * Progress Component with Gradient Support
 *
 * Based on Radix UI Progress primitive
 * Supports custom gradients for VA-PC theme
 */

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Show value label */
  showValue?: boolean;
  /** Custom gradient (e.g., "from-purple-500 to-pink-500") */
  gradient?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value = 0,
      max = 100,
      showValue = false,
      gradient = "from-[#9D4EDD] to-[#6A4C93]", // VA-PC purple gradient
      size = "md",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
      sm: "h-2",
      md: "h-3",
      lg: "h-4",
    };

    return (
      <div className="relative w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative overflow-hidden rounded-full bg-white/10",
            sizeClasses[size],
            className
          )}
          value={value}
          max={max}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 transition-all duration-500 ease-out",
              "bg-gradient-to-r",
              gradient
            )}
            style={{
              transform: `translateX(-${100 - percentage}%)`,
            }}
          />
        </ProgressPrimitive.Root>

        {showValue && (
          <div className="mt-1 text-right text-xs text-white/60">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress, type ProgressProps };
