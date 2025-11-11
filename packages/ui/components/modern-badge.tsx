import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Modern Badge Component - 2025 Trends
 * Features: Gradient backgrounds, glassmorphism, colorful shadows
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105",
  {
    variants: {
      variant: {
        // Gradient variants (2025 trend)
        gradient: "badge-gradient gradient-primary shadow-purple",
        "gradient-success": "badge-gradient gradient-success shadow-green",
        "gradient-warning": "badge-gradient gradient-warning shadow-pink",
        "gradient-info": "badge-gradient gradient-info shadow-cyan",

        // Glass variants (glassmorphism)
        glass: "badge-modern glass",
        "glass-primary": "badge-modern glass border-purple-500/30 text-purple-300",
        "glass-success": "badge-modern glass border-green-500/30 text-green-300",
        "glass-warning": "badge-modern glass border-pink-500/30 text-pink-300",

        // Solid variants (with colorful shadows)
        solid: "px-3 py-1 bg-gray-800 text-gray-200 shadow-lg",
        primary: "px-3 py-1 bg-purple-600 text-white shadow-purple",
        success: "px-3 py-1 bg-green-600 text-white shadow-green",
        destructive: "px-3 py-1 bg-red-600 text-white shadow-pink",

        // Outline variants (modern borders)
        outline: "px-3 py-1 border-2 border-gray-700 text-gray-300 hover:border-purple-500/50",
        "outline-primary": "px-3 py-1 border-2 border-purple-500/50 text-purple-300 hover:bg-purple-500/10",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
      glow: {
        true: "animate-pulse-glow",
        false: "",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "md",
      glow: false,
    },
  }
);

export interface ModernBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before text
   */
  icon?: React.ReactNode;
}

export function ModernBadge({
  className,
  variant,
  size,
  glow,
  icon,
  children,
  ...props
}: ModernBadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size, glow }), className)}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}
