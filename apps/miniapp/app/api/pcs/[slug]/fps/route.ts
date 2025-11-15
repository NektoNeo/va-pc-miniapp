import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withTelegramAuth, type TelegramAuthRequest } from "@/lib/middleware/telegram-auth";

/**
 * GET /api/pcs/[slug]/fps
 * Публичный API для получения FPS метрик конкретной PC сборки
 * Используется в Mini App для отображения производительности
 */
async function handler(
  request: TelegramAuthRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Найти PC сборку по slug
    const pcBuild = await db.pcBuild.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!pcBuild) {
      return NextResponse.json(
        { error: "PC сборка не найдена" },
        { status: 404 }
      );
    }

    // Получить все FPS метрики для этой сборки
    const metrics = await db.fpsMetric.findMany({
      where: { pcId: pcBuild.id },
      orderBy: [
        { resolution: "asc" }, // FHD -> QHD -> UHD4K
        { game: "asc" },
      ],
      select: {
        id: true,
        game: true,
        resolution: true,
        fpsMin: true,
        fpsAvg: true,
        fpsP95: true,
      },
    });

    // Группировка метрик по разрешению для удобства отображения в Tabs
    const groupedByResolution = {
      FHD: metrics.filter((m) => m.resolution === "FHD"),
      QHD: metrics.filter((m) => m.resolution === "QHD"),
      UHD4K: metrics.filter((m) => m.resolution === "UHD4K"),
    };

    return NextResponse.json({
      pcBuild: {
        id: pcBuild.id,
        title: pcBuild.title,
        slug: pcBuild.slug,
      },
      metrics,
      groupedByResolution,
      totalMetrics: metrics.length,
    });
  } catch (error) {
    console.error("[PUBLIC_FPS_GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить FPS метрики" },
      { status: 500 }
    );
  }
}

export const GET = withTelegramAuth(handler);
