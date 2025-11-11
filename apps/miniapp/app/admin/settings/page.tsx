import { Suspense } from "react";
import { db } from "@/lib/db";
import { TopProductsEditor } from "@/components/admin/settings/top-products-editor";
import { BudgetPresetsEditor } from "@/components/admin/settings/budget-presets-editor";
import { TelegraphLinksEditor } from "@/components/admin/settings/telegraph-links-editor";
import type { Prisma } from "@prisma/client";

/**
 * Settings Page - Server Component
 *
 * Управление глобальными настройками платформы:
 * - Top-4 товары (PC Builds и Devices) с drag-and-drop
 * - Budget presets для фильтров
 * - Telegraph ссылки на документы
 */

type SettingsWithRelations = Prisma.SettingsGetPayload<{
  include: {
    _count: true;
  };
}>;

type PCBuildListItem = Prisma.PcBuildGetPayload<{
  select: {
    id: true;
    title: true;
    subtitle: true;
    priceBase: true;
    coverImage: {
      select: {
        id: true;
        key: true;
        avgColor: true;
      };
    };
  };
}>;

/**
 * Получение настроек (всегда существует одна запись)
 */
async function getSettings(): Promise<SettingsWithRelations | null> {
  try {
    // Проверяем существование записи Settings
    let settings = await db.settings.findUnique({
      where: { id: "singleton" },
    });

    // Если записи нет - создаём дефолтную
    if (!settings) {
      settings = await db.settings.create({
        data: {
          id: "singleton",
          topPcIds: [],
          topDeviceIds: [],
          budgetPresets: [
            [46000, 100000],
            [100000, 150000],
            [150000, 225000],
            [225000, 300000],
            [300000, 500000],
          ],
          telegraph: {
            privacy: "",
            offer: "",
            pd_consent: "",
            review_consent: "",
            faq: "",
          },
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("[Settings Page] Fetch error:", error);
    return null;
  }
}

/**
 * Получение PC Builds для Top-4 selector
 */
async function getAvailablePCBuilds(): Promise<PCBuildListItem[]> {
  try {
    const pcBuilds = await db.pcBuild.findMany({
      where: {
        availability: { in: ["IN_STOCK", "PREORDER"] }, // Включаем товары в наличии и предзаказе
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        priceBase: true,
        coverImage: {
          select: {
            id: true,
            key: true,
            avgColor: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Лимит для выбора
    });

    return pcBuilds;
  } catch (error) {
    console.error("[Settings Page] PCBuilds fetch error:", error);
    return [];
  }
}

/**
 * Loading компонент для Suspense
 */
function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
      <div className="h-96 w-full animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}

export default async function SettingsPage() {
  const [settings, availablePCBuilds] = await Promise.all([
    getSettings(),
    getAvailablePCBuilds(),
  ]);

  if (!settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-white/60">Не удалось загрузить настройки</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки платформы</h1>
        <p className="text-sm text-white/60 mt-1">
          Управление Top-4 товарами, бюджетными фильтрами и документами
        </p>
      </div>

      {/* Top Products Section */}
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <TopProductsEditor
          initialTopPcIds={settings.topPcIds}
          initialTopDeviceIds={settings.topDeviceIds}
          availablePCBuilds={availablePCBuilds}
        />
      </Suspense>

      {/* Budget Presets Editor */}
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <BudgetPresetsEditor
          initialPresets={settings.budgetPresets as [number, number][]}
        />
      </Suspense>

      {/* Telegraph Links Editor */}
      <Suspense fallback={<SettingsLoadingSkeleton />}>
        <TelegraphLinksEditor
          initialLinks={
            settings.telegraph as {
              privacy: string;
              offer: string;
              pd_consent: string;
              review_consent: string;
              faq: string;
            }
          }
        />
      </Suspense>
    </div>
  );
}

/**
 * Metadata для страницы
 */
export const metadata = {
  title: "Настройки | VA-PC Admin",
  description: "Управление настройками платформы",
};
