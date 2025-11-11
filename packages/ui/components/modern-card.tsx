import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Modern Card Component - 2025 Trends
 * Features: Glassmorphism, gradient borders, colorful shadows, hover animations
 */

const modernCardVariants = cva(
  "flex flex-col gap-4 rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        // Glass variants (glassmorphism)
        glass: "card-glass",
        "glass-strong": "glass-strong border shadow-2xl",

        // Bordered variants (modern borders with gradients)
        bordered: "card-bordered",
        "bordered-gradient": "border-gradient bg-gray-900/50 border border-transparent shadow-2xl",

        // Solid variants (with colorful shadows)
        solid: "bg-card border border-border shadow-lg",
        primary: "bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 shadow-purple",

        // Elevated variants (strong 3D effect)
        elevated: "bg-card border border-border shadow-2xl hover:shadow-purple shadow-lift",

        // Neomorphic variants
        neo: "neo-raised",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hover: {
        true: "hover:scale-[1.02] cursor-pointer",
        false: "",
      },
      glow: {
        true: "glow-primary",
        false: "",
      },
    },
    defaultVariants: {
      variant: "glass",
      size: "md",
      hover: false,
      glow: false,
    },
  }
);

export interface ModernCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernCardVariants> {
  /**
   * Render card header with gradient background
   */
  withGradientHeader?: boolean;
}

function ModernCard({
  className,
  variant,
  size,
  hover,
  glow,
  withGradientHeader,
  children,
  ...props
}: ModernCardProps) {
  return (
    <div
      data-slot="modern-card"
      className={cn(modernCardVariants({ variant, size, hover, glow }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

function ModernCardHeader({
  className,
  withGradient,
  ...props
}: React.ComponentProps<"div"> & { withGradient?: boolean }) {
  return (
    <div
      data-slot="modern-card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        withGradient && "gradient-primary -mx-6 -mt-6 mb-2 px-6 py-4 rounded-t-2xl",
        className
      )}
      {...props}
    />
  );
}

function ModernCardTitle({
  className,
  withGlow,
  ...props
}: React.ComponentProps<"div"> & { withGlow?: boolean }) {
  return (
    <div
      data-slot="modern-card-title"
      className={cn(
        "leading-none font-bold text-lg",
        withGlow && "text-glow",
        className
      )}
      {...props}
    />
  );
}

function ModernCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modern-card-description"
      className={cn("text-muted-foreground text-sm leading-relaxed", className)}
      {...props}
    />
  );
}

function ModernCardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function ModernCardContent({
  className,
  withDivider,
  ...props
}: React.ComponentProps<"div"> & { withDivider?: boolean }) {
  return (
    <div
      data-slot="modern-card-content"
      className={cn(
        withDivider && "border-t border-gray-700/30 pt-4",
        className
      )}
      {...props}
    />
  );
}

function ModernCardFooter({
  className,
  withDivider,
  ...props
}: React.ComponentProps<"div"> & { withDivider?: boolean }) {
  return (
    <div
      data-slot="modern-card-footer"
      className={cn(
        "flex items-center gap-2",
        withDivider && "border-t border-gray-700/30 pt-4",
        className
      )}
      {...props}
    />
  );
}

/**
 * Pre-configured modern card patterns
 */

export function GlassCard({ className, children, ...props }: ModernCardProps) {
  return (
    <ModernCard
      variant="glass"
      hover
      className={className}
      {...props}
    >
      {children}
    </ModernCard>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
  children,
  ...props
}: ModernCardProps & {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <ModernCard variant="bordered" hover {...props}>
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center glow-primary">
          {icon}
        </div>
      )}
      {title && <ModernCardTitle withGlow>{title}</ModernCardTitle>}
      {description && <ModernCardDescription>{description}</ModernCardDescription>}
      {children && <ModernCardContent>{children}</ModernCardContent>}
    </ModernCard>
  );
}

export function StatCard({
  label,
  value,
  trend,
  icon,
  ...props
}: ModernCardProps & {
  label?: string;
  value?: string | number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
}) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gray-400",
  };

  return (
    <ModernCard variant="glass" hover {...props}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-glow">{value}</p>
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn("text-sm font-medium", trendColors[trend])}>
          {trend === "up" && "↑"} {trend === "down" && "↓"} {trend === "neutral" && "→"}
        </div>
      )}
    </ModernCard>
  );
}

export {
  ModernCard,
  ModernCardHeader,
  ModernCardFooter,
  ModernCardTitle,
  ModernCardAction,
  ModernCardDescription,
  ModernCardContent,
};
