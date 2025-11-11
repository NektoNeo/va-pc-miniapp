"use client";

import { memo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@vapc/ui/components";
import type { PC } from "@/types/pc";

interface PCCardProps {
  pc: PC;
}

// Memoized for performance - prevents unnecessary re-renders in PC grids
export const PCCard = memo(({ pc }: PCCardProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/pcs/${pc.slug}`}>
      <Card className="group card-glass shadow-purple shadow-lift cursor-pointer h-full overflow-hidden animate-fade-in-up">
        <CardHeader className="relative pb-0">
          <div className="flex items-start justify-between gap-2 z-10 relative">
            <CardTitle className="text-lg font-bold transition-all group-hover:text-accent glow-hover">
              {pc.name}
            </CardTitle>
            <Badge variant="neon" className="badge-gradient gradient-primary animate-scale-in">
              {pc.quality}
            </Badge>
          </div>
          {/* Gradient overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {/* Optimized: Using Next.js Image with glassmorphism overlay */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted group-hover:scale-[1.02] transition-transform duration-500">
            {!imageError && pc.thumbnail ? (
              <Image
                src={pc.thumbnail}
                alt={pc.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => setImageError(true)}
              />
            ) : (
              // Fallback placeholder with gradient and icon
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20">
                <svg
                  className="w-16 h-16 text-primary/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
            {/* Glassmorphism overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 transition-colors group-hover:text-foreground/90">
            {pc.description}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <p className="text-2xl font-bold text-primary text-glow transition-all group-hover:scale-105">
              {pc.price.toLocaleString("ru-RU")} ₽
            </p>
            {/* Subtle arrow indicator on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

PCCard.displayName = "PCCard";
