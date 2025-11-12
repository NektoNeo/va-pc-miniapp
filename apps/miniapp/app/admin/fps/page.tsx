import { Suspense } from "react";

/**
 * FPS Metrics Page - Управление FPS метриками
 *
 * Показывает таблицу всех FPS метрик с возможностью:
 * - Просмотра метрик по играм и разрешениям
 * - Добавления новых метрик
 * - Редактирования существующих
 * - Удаления метрик
 */

/**
 * Loading компонент для Suspense
 */
function FPSMetricsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
      <div className="h-96 w-full animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}

export default async function FPSMetricsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FPS Метрики</h1>
          <p className="text-sm text-white/60 mt-1">
            Управление производительностью игр в различных разрешениях
          </p>
        </div>
      </div>

      {/* FPS Metrics Content */}
      <Suspense fallback={<FPSMetricsLoadingSkeleton />}>
        <div className="rounded-xl border border-[#9D4EDD]/20 bg-white/5 p-6 backdrop-blur-lg">
          <p className="text-white/60">
            FPS метрики будут отображаться здесь. Компонент FpsMetricsManager будет интегрирован в следующей версии.
          </p>
          <p className="mt-4 text-xs text-white/40">
            Путь к компоненту: /components/admin/fps/fps-metrics-manager.tsx
          </p>
        </div>
      </Suspense>
    </div>
  );
}

/**
 * Metadata для страницы
 */
export const metadata = {
  title: "FPS Метрики | VA-PC Admin",
  description: "Управление FPS метриками и производительностью игр",
};
