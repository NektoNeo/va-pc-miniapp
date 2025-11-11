import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Modern Button Component - 2025 Trends
 * Features: Gradient backgrounds, shimmer effects, micro-animations, colorful shadows
 */

const modernButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Gradient variants (2025 trend)
        gradient: "btn-gradient gradient-primary text-white shadow-purple",
        "gradient-success": "btn-gradient gradient-success text-white shadow-green",
        "gradient-warning": "btn-gradient gradient-warning text-white shadow-pink",
        "gradient-info": "btn-gradient gradient-info text-white shadow-cyan",

        // Glass variants (glassmorphism)
        glass: "btn-glass",
        "glass-primary": "glass bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 shadow-purple",
        "glass-success": "glass bg-green-600/20 text-green-300 border border-green-500/30 hover:bg-green-600/30 shadow-green",

        // Solid variants with shadow lift
        solid: "bg-gray-800 text-gray-200 hover:bg-gray-700 shadow-lift",
        primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-purple shadow-lift",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-green shadow-lift",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-pink shadow-lift",

        // Outline variants
        outline: "border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-smooth",
        "outline-primary": "border-2 border-purple-500/50 text-purple-300 hover:bg-purple-600/10 hover:border-purple-500 transition-smooth",

        // Neomorphic variant
        neo: "neo-raised text-gray-200 hover:neo-inset transition-smooth",

        // Link variant
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",

        // Ghost variant
        ghost: "text-gray-300 hover:bg-gray-800/50 hover:text-white transition-smooth",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-lg",
        md: "h-11 px-6 text-sm rounded-xl",
        lg: "h-13 px-8 text-base rounded-xl",
        xl: "h-16 px-12 text-lg rounded-2xl",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-lg": "h-13 w-13 rounded-xl",
      },
      animation: {
        none: "",
        shimmer: "animate-shimmer",
        glow: "animate-pulse-glow",
        "scale-bounce": "hover:scale-105 active:scale-95",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "md",
      animation: "scale-bounce",
    },
  }
);

export interface ModernButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof modernButtonVariants> {
  asChild?: boolean;
  /**
   * Icon to display before text
   */
  iconLeft?: React.ReactNode;
  /**
   * Icon to display after text
   */
  iconRight?: React.ReactNode;
  /**
   * Loading state with spinner
   */
  loading?: boolean;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ModernButtonProps>(
  (
    {
      className,
      variant,
      size,
      animation,
      asChild = false,
      iconLeft,
      iconRight,
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          modernButtonVariants({ variant, size, animation }),
          loading && "cursor-wait opacity-80",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {children}
          </>
        ) : (
          <>
            {iconLeft && <span className="mr-1">{iconLeft}</span>}
            {children}
            {iconRight && <span className="ml-1">{iconRight}</span>}
          </>
        )}
      </Comp>
    );
  }
);
ModernButton.displayName = "ModernButton";

/**
 * Loading Spinner Component
 */
function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Pre-configured modern button patterns
 */

export function GradientButton({
  children,
  ...props
}: Omit<ModernButtonProps, "variant">) {
  return (
    <ModernButton variant="gradient" {...props}>
      {children}
    </ModernButton>
  );
}

export function GlassButton({
  children,
  ...props
}: Omit<ModernButtonProps, "variant">) {
  return (
    <ModernButton variant="glass-primary" {...props}>
      {children}
    </ModernButton>
  );
}

export function IconButton({
  icon,
  ...props
}: Omit<ModernButtonProps, "size"> & { icon: React.ReactNode }) {
  return (
    <ModernButton size="icon" {...props}>
      {icon}
    </ModernButton>
  );
}

export { ModernButton, modernButtonVariants };
