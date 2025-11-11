import { cn } from "../lib/utils";

/**
 * Skeleton Loader Component - 2025 Trends
 * Features: Shimmer animation, multiple shape variants, responsive sizing
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shape variant for different use cases
   */
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar";
  /**
   * Width of the skeleton (can be any CSS value)
   */
  width?: string | number;
  /**
   * Height of the skeleton (can be any CSS value)
   */
  height?: string | number;
  /**
   * Number of lines (only for text variant)
   */
  lines?: number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
  style,
  ...props
}: SkeletonProps) {
  // Text variant - multiple lines
  if (variant === "text" && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "skeleton h-4",
              index === lines - 1 && "w-4/5", // Last line shorter
              className
            )}
            style={{
              width: index === lines - 1 ? "80%" : width,
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  // Single skeleton element
  const variantClasses = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-2xl h-48 w-full",
    avatar: "rounded-full w-12 h-12",
  };

  return (
    <div
      className={cn("skeleton", variantClasses[variant], className)}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Pre-configured skeleton patterns for common use cases
 */

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return <Skeleton variant="text" lines={lines} />;
}

export function SkeletonCard() {
  return (
    <div className="card-glass space-y-4">
      <Skeleton variant="rectangular" height="200px" />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" height="20px" />
        <Skeleton variant="text" lines={2} />
      </div>
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width="80px" height="32px" />
        <Skeleton variant="rectangular" width="80px" height="32px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-gray-700/30">
        <Skeleton variant="text" width="120px" height="16px" />
        <Skeleton variant="text" width="200px" height="16px" />
        <Skeleton variant="text" width="100px" height="16px" />
        <Skeleton variant="text" width="80px" height="16px" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" height="16px" />
            <Skeleton variant="text" width="40%" height="12px" />
          </div>
          <Skeleton variant="rectangular" width="100px" height="32px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className={sizeClasses[size]} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="150px" height="16px" />
        <Skeleton variant="text" width="100px" height="12px" />
      </div>
    </div>
  );
}
