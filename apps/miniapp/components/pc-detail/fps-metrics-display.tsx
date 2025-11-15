"use client";

import { useState } from "react";
import { Progress } from "@vapc/ui/components/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vapc/ui/components/tabs";
import { getGameIcon } from "@/lib/game-icons";
import { cn } from "@/lib/utils";

/**
 * FPS Metric Type
 */
interface FpsMetric {
  id: string;
  game: string;
  resolution: "FHD" | "QHD" | "UHD4K";
  fpsMin: number | null;
  fpsAvg: number;
  fpsP95: number | null;
}

/**
 * Grouped FPS Metrics by Resolution
 */
interface GroupedFpsMetrics {
  FHD: FpsMetric[];
  QHD: FpsMetric[];
  UHD4K: FpsMetric[];
}

interface FPSMetricsDisplayProps {
  /** PC Build slug */
  slug: string;
  /** Grouped metrics by resolution */
  groupedByResolution: GroupedFpsMetrics;
}

/**
 * Single FPS Card Component
 */
function FPSCard({ metric }: { metric: FpsMetric }) {
  const gameInfo = getGameIcon(metric.game);

  // Calculate progress percentage (assuming max 240 FPS)
  const maxFps = 240;
  const percentage = (metric.fpsAvg / maxFps) * 100;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-4",
        "backdrop-blur-lg transition-all duration-300",
        "hover:border-[#9D4EDD]/40 hover:bg-white/10"
      )}
    >
      {/* Game Icon */}
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg text-2xl"
        style={{
          backgroundColor: `${gameInfo.color}20`,
          border: `1px solid ${gameInfo.color}40`,
        }}
      >
        {gameInfo.emoji}
      </div>

      {/* Game Name & FPS Progress */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            {metric.game}
          </span>
          <span className="text-lg font-bold text-[#9D4EDD]">
            {metric.fpsAvg}
            <span className="ml-1 text-xs font-normal text-white/60">FPS</span>
          </span>
        </div>

        {/* Progress Bar */}
        <Progress
          value={percentage}
          max={100}
          size="md"
          gradient="from-[#9D4EDD] via-[#B267E8] to-[#808080]"
          className="w-full"
        />

        {/* Min/P95 Stats (optional) */}
        {(metric.fpsMin !== null || metric.fpsP95 !== null) && (
          <div className="flex gap-3 text-xs text-white/40">
            {metric.fpsMin !== null && (
              <span>Min: {metric.fpsMin} FPS</span>
            )}
            {metric.fpsP95 !== null && (
              <span>P95: {metric.fpsP95} FPS</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Resolution Tab Content
 */
function ResolutionTabContent({ metrics }: { metrics: FpsMetric[] }) {
  if (metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#9D4EDD]/20 bg-white/5 p-8 text-center">
        <p className="text-sm text-white/60">
          Нет данных FPS для этого разрешения
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {metrics.map((metric) => (
        <FPSCard key={metric.id} metric={metric} />
      ))}
    </div>
  );
}

/**
 * FPS Metrics Display Component for Mini App
 *
 * Displays FPS performance metrics with:
 * - Tabs for FHD, 2K (QHD), 4K (UHD) resolutions
 * - FPS cards with game icon, name, and progress bar
 * - VA-PC dark theme with purple gradients
 */
export function FPSMetricsDisplay({
  slug,
  groupedByResolution,
}: FPSMetricsDisplayProps) {
  const [activeTab, setActiveTab] = useState<"FHD" | "QHD" | "UHD4K">("FHD");

  // Check if there are any metrics at all
  const hasMetrics =
    groupedByResolution.FHD.length > 0 ||
    groupedByResolution.QHD.length > 0 ||
    groupedByResolution.UHD4K.length > 0;

  if (!hasMetrics) {
    return null; // Don't render if no metrics
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          Производительность в играх
        </h3>
        <span className="text-xs text-white/40">FPS метрики</span>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-lg">
          <TabsTrigger value="FHD" className="data-[state=active]:bg-[#9D4EDD]/20">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium">Full HD</span>
              <span className="text-xs text-white/60">1080p</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="QHD" className="data-[state=active]:bg-[#9D4EDD]/20">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium">2K</span>
              <span className="text-xs text-white/60">1440p</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="UHD4K" className="data-[state=active]:bg-[#9D4EDD]/20">
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium">4K</span>
              <span className="text-xs text-white/60">2160p</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="FHD" className="mt-4">
          <ResolutionTabContent metrics={groupedByResolution.FHD} />
        </TabsContent>

        <TabsContent value="QHD" className="mt-4">
          <ResolutionTabContent metrics={groupedByResolution.QHD} />
        </TabsContent>

        <TabsContent value="UHD4K" className="mt-4">
          <ResolutionTabContent metrics={groupedByResolution.UHD4K} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
