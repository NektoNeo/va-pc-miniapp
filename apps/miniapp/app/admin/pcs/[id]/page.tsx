import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PCBuildForm } from "@/components/admin/pc-builds/pc-build-form";
import type { Prisma } from "@prisma/client";

/**
 * PC Build Form Page - Server Component
 *
 * Routes:
 * - /admin/pcs/new - создание новой сборки
 * - /admin/pcs/[id] - редактирование существующей сборки
 */

type PCBuildWithRelations = Prisma.PcBuildGetPayload<{
  include: {
    coverImage: true;
    gallery: true;
    video: true;
  };
}>;

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Получение данных существующей сборки для редактирования
 */
async function getPCBuild(id: string): Promise<PCBuildWithRelations | null> {
  try {
    const pcBuild = await db.pcBuild.findUnique({
      where: { id },
      include: {
        coverImage: true,
        gallery: true,
        video: true,
      },
    });

    return pcBuild;
  } catch (error) {
    console.error("[PC Build Page] Fetch error:", error);
    return null;
  }
}

export default async function PCBuildFormPage({ params }: PageProps) {
  const resolvedParams = await params;
  const isNew = resolvedParams.id === "new";

  // Для edit режима - загружаем данные
  let pcBuild: PCBuildWithRelations | null = null;

  if (!isNew) {
    pcBuild = await getPCBuild(resolvedParams.id);

    if (!pcBuild) {
      notFound();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isNew ? "Создание сборки ПК" : `Редактирование: ${pcBuild?.title}`}
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {isNew
              ? "Заполните информацию о новой сборке"
              : "Обновите данные существующей сборки"
            }
          </p>
        </div>
      </div>

      {/* Form Component */}
      <PCBuildForm initialData={pcBuild} isEdit={!isNew} />
    </div>
  );
}

/**
 * Metadata для страницы
 */
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const isNew = resolvedParams.id === "new";

  if (isNew) {
    return {
      title: "Создание сборки ПК | VA-PC Admin",
    };
  }

  const pcBuild = await getPCBuild(resolvedParams.id);

  return {
    title: pcBuild
      ? `Редактирование: ${pcBuild.title} | VA-PC Admin`
      : "Сборка не найдена | VA-PC Admin",
  };
}
