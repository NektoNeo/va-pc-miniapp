"use client";

import { useQuery } from "@tanstack/react-query";
import { BudgetFilter } from "@/components/pcs/budget-filter";
import { QualityFilterComponent } from "@/components/pcs/quality-filter";
import { PCCard } from "@/components/pcs/pc-card";
import { useFiltersStore } from "@/stores/filters";
import { useTelegramBackButton } from "@/lib/telegram/navigation";
import type { PCListResponse } from "@/types/pc";
import { Button, Card, CardContent } from "@vapc/ui/components";
import { PageHeader } from "@/components/layout/page-header";
import { QuickAccessTiles } from "@/components/layout/quick-access-tiles";

export default function PCsPage() {
  const { budgetPreset, qualityFilter, clearFilters, getBudgetRange } =
    useFiltersStore();
  useTelegramBackButton();

  const budgetRange = getBudgetRange();

  const { data, isLoading } = useQuery<PCListResponse>({
    queryKey: ["pcs", budgetPreset, qualityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (budgetRange) {
        params.set("minPrice", budgetRange.min.toString());
        params.set("maxPrice", budgetRange.max.toString());
      }
      if (qualityFilter) {
        params.set("quality", qualityFilter);
      }

      const res = await fetch(`/api/pcs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch PCs");
      return res.json();
    },
  });

  const hasActiveFilters = budgetPreset !== "none" || qualityFilter !== null;

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <PageHeader title="Игровые ПК" />

        {/* Quick Access Tiles */}
        <QuickAccessTiles />

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="glass hover:glass-strong transition-all shadow-purple text-xs"
            >
              Сбросить фильтры
            </Button>
          </div>
        )}

        {/* Modern Filters - Optimized for Mobile */}
        <div className="relative animate-fade-in-up [animation-delay:100ms]">
          <Card className="card-glass shadow-cyan border-glass-border overflow-hidden">
            <CardContent className="relative z-10 p-6 space-y-6">
              <BudgetFilter />
              <QualityFilterComponent />
            </CardContent>
          </Card>
        </div>

        {/* Results with Modern Styling */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="card-glass shadow-purple animate-pulse overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardContent className="p-4">
                  <div className="h-64 bg-muted/30 rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between animate-fade-in-up [animation-delay:200ms]">
              <p className="text-sm text-foreground/90">
                Найдено: <span className="text-primary font-semibold glow-primary">{data?.total || 0}</span> сборок
              </p>
            </div>

            {data && data.pcs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.pcs.map((pc) => (
                  <div key={pc.id} className="animate-fade-in-up">
                    <PCCard pc={pc} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative animate-fade-in-up">
                <Card className="card-glass shadow-purple border-glass-border overflow-hidden">
                  <CardContent className="relative z-10 p-12 text-center space-y-4">
                    <div className="text-6xl opacity-20 mb-4">🔍</div>
                    <p className="text-lg text-foreground/70">
                      По выбранным фильтрам ничего не найдено
                    </p>
                    <Button
                      variant="outline"
                      className="glass hover:glass-strong shadow-purple mt-4"
                      onClick={clearFilters}
                    >
                      Сбросить фильтры
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
