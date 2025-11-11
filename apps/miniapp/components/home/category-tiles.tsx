"use client";

import { memo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@vapc/ui/components";
import { Monitor, Gamepad2 } from "lucide-react";

// Memoized - static content, no need to re-render
export const CategoryTiles = memo(() => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Link href="/pcs">
        <Card className="group relative card-glass shadow-purple shadow-lift cursor-pointer h-full overflow-hidden animate-fade-in-up">
          {/* Animated gradient background */}
          <div className="absolute inset-0 gradient-mesh-purple opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <CardContent className="relative flex flex-col items-center justify-center p-8 gap-4 z-10">
            <div className="relative">
              <Gamepad2 className="w-12 h-12 text-primary transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 animate-pulse-glow" />
              {/* Glow effect on hover */}
              <div className="absolute inset-0 glow-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </div>

            <h2 className="text-xl font-bold text-center text-glow transition-all group-hover:text-accent">
              Игровые ПК
            </h2>
            <p className="text-sm text-muted-foreground text-center transition-colors group-hover:text-foreground/90">
              Готовые сборки
            </p>

            {/* Hover arrow indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/devices">
        <Card className="group relative card-glass shadow-cyan shadow-lift cursor-pointer h-full overflow-hidden animate-fade-in-up [animation-delay:100ms]">
          {/* Animated gradient background */}
          <div className="absolute inset-0 gradient-mesh-cyan opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          <CardContent className="relative flex flex-col items-center justify-center p-8 gap-4 z-10">
            <div className="relative">
              <Monitor className="w-12 h-12 text-primary transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 animate-pulse-glow" />
              {/* Glow effect on hover */}
              <div className="absolute inset-0 glow-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
            </div>

            <h2 className="text-xl font-bold text-center text-glow transition-all group-hover:text-accent">
              Девайсы
            </h2>
            <p className="text-sm text-muted-foreground text-center transition-colors group-hover:text-foreground/90">
              Периферия и аксессуары
            </p>

            {/* Hover arrow indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
});

CategoryTiles.displayName = "CategoryTiles";
