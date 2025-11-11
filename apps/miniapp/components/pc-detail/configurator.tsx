"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@vapc/ui/components";
import { useConfigStore } from "@/stores/config";
import type { ConfigOptions } from "@/types/pc";

interface ConfiguratorProps {
  options: ConfigOptions;
  basePrice: number;
}

export function Configurator({ options, basePrice }: ConfiguratorProps) {
  const {
    selectedRam,
    selectedSsd,
    setSelectedRam,
    setSelectedSsd,
    setBasePrice,
    getTotalPrice,
    reset,
  } = useConfigStore();

  // Initialize on mount
  useEffect(() => {
    setBasePrice(basePrice);

    // Set defaults
    const defaultRam = options.ram.find((r) => r.default);
    const defaultSsd = options.ssd.find((s) => s.default);

    if (defaultRam && !selectedRam) setSelectedRam(defaultRam);
    if (defaultSsd && !selectedSsd) setSelectedSsd(defaultSsd);

    return () => {
      reset();
    };
  }, [basePrice, options, selectedRam, selectedSsd, setBasePrice, setSelectedRam, setSelectedSsd, reset]);

  const totalPrice = getTotalPrice();

  return (
    <div className="relative">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh-purple opacity-5 blur-2xl -z-10 animate-pulse-glow" />

      <Card className="card-glass shadow-purple shadow-lift border-glass-border overflow-hidden animate-fade-in-up">
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-primary opacity-5" />

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-glow">Конфигурация</CardTitle>
            <div className="relative">
              <p className="text-2xl md:text-3xl font-bold text-primary glow-primary animate-scale-in">
                {totalPrice.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* RAM Options */}
          <div className="space-y-3 animate-fade-in-up [animation-delay:100ms]">
            <h3 className="text-sm font-medium text-muted-foreground/90">Оперативная память</h3>
            <div className="grid grid-cols-1 gap-2">
              {options.ram.map((option, index) => {
                const isSelected = selectedRam?.id === option.id;
                const priceChange = option.priceDelta;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedRam(option)}
                    className={`group relative p-4 rounded-lg border-2 transition-all duration-300 text-left overflow-hidden animate-fade-in-up ${
                      isSelected
                        ? "border-primary bg-primary/10 glass-strong shadow-purple scale-[1.02]"
                        : "border-border/50 glass hover:border-primary/50 hover:glass-strong hover:shadow-purple"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient overlay for selected state */}
                    {isSelected && (
                      <div className="absolute inset-0 gradient-primary opacity-10 animate-shimmer" />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`font-medium transition-colors ${isSelected ? 'text-primary glow-primary' : 'group-hover:text-foreground'}`}>
                        {option.label}
                      </span>
                      {priceChange !== 0 && (
                        <Badge
                          variant={priceChange > 0 ? "neon" : "glass"}
                          className="shadow-sm"
                        >
                          {priceChange > 0 ? "+" : ""}
                          {priceChange.toLocaleString("ru-RU")} ₽
                        </Badge>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary glow-primary animate-pulse-glow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SSD Options */}
          <div className="space-y-3 animate-fade-in-up [animation-delay:200ms]">
            <h3 className="text-sm font-medium text-muted-foreground/90">Накопитель</h3>
            <div className="grid grid-cols-1 gap-2">
              {options.ssd.map((option, index) => {
                const isSelected = selectedSsd?.id === option.id;
                const priceChange = option.priceDelta;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedSsd(option)}
                    className={`group relative p-4 rounded-lg border-2 transition-all duration-300 text-left overflow-hidden animate-fade-in-up ${
                      isSelected
                        ? "border-accent bg-accent/10 glass-strong shadow-cyan scale-[1.02]"
                        : "border-border/50 glass hover:border-accent/50 hover:glass-strong hover:shadow-cyan"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Gradient overlay for selected state */}
                    {isSelected && (
                      <div className="absolute inset-0 gradient-mesh-cyan opacity-10 animate-shimmer" />
                    )}

                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`font-medium transition-colors ${isSelected ? 'text-accent glow-accent' : 'group-hover:text-foreground'}`}>
                        {option.label}
                      </span>
                      {priceChange !== 0 && (
                        <Badge
                          variant={priceChange > 0 ? "neon" : "glass"}
                          className="shadow-sm"
                        >
                          {priceChange > 0 ? "+" : ""}
                          {priceChange.toLocaleString("ru-RU")} ₽
                        </Badge>
                      )}
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent glow-accent animate-pulse-glow" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
