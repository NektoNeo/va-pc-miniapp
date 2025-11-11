import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { PCBuildsTable } from "@/components/admin/pc-builds/pc-builds-table";
import type { Prisma } from "@prisma/client";

/**
 * PC Builds List Page - Server Component
 *
 * Показывает все PC Builds в виде таблицы с возможностью:
 * - Поиска по названию
 * - Сортировки по различным полям
 * - Фильтрации по статусу
 * - Редактирования/удаления
 */

type PCBuildListItem = Prisma.PcBuildGetPayload<{
  include: {
    coverImage: {
      select: {
        id: true;
        key: true;
        blurhash: true;
        avgColor: true;
      };
    };
    _count: {
      select: {
        gallery: true;
        fpsMetrics: true;
      };
    };
  };
}>;

/**
 * Получение всех PC Builds для отображения в таблице
 */
async function getPCBuilds(): Promise<PCBuildListItem[]> {
  try {
    const pcBuilds = await db.pcBuild.findMany({
      include: {
        coverImage: {
          select: {
            id: true,
            key: true,
            blurhash: true,
            avgColor: true,
          },
        },
        _count: {
          select: {
            gallery: true,
            fpsMetrics: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return pcBuilds;
  } catch (error) {
    console.error("[PC Builds List] Fetch error:", error);
    return [];
  }
}

/**
 * Loading компонент для Suspense
 */
function PCBuildsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full max-w-sm animate-pulse rounded-lg bg-white/5" />
      <div className="h-96 w-full animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}

export default async function PCBuildsListPage() {
  const pcBuilds = await getPCBuilds();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Сборки ПК</h1>
          <p className="text-sm text-white/60 mt-1">
            Управление каталогом готовых сборок ({pcBuilds.length})
          </p>
        </div>

        {/* Create New Button */}
        <Link
          href="/admin/pcs/new"
          className="inline-flex items-center gap-2 rounded-lg border border-[#9D4EDD]/20 bg-[#9D4EDD] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#9D4EDD]/90 hover:shadow-[0_0_20px_rgba(157,78,221,0.4)]"
        >
          <Plus className="h-4 w-4" />
          Создать сборку
        </Link>
      </div>

      {/* Table */}
      <Suspense fallback={<PCBuildsTableSkeleton />}>
        <PCBuildsTable data={pcBuilds} />
      </Suspense>
    </div>
  );
}

/**
 * Metadata для страницы
 */
export const metadata = {
  title: "Сборки ПК | VA-PC Admin",
  description: "Управление каталогом готовых PC builds",
};
