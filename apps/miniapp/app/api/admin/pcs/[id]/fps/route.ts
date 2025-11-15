import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fpsMetricFormSchema } from "@/lib/validations/fps-metrics";

/**
 * GET /api/admin/pcs/[id]/fps
 * Получение всех FPS метрик для конкретной PC сборки
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pcId } = await params;

    // Проверка существования PC сборки
    const pcBuild = await db.pcBuild.findUnique({
      where: { id: pcId },
      select: { id: true, title: true },
    });

    if (!pcBuild) {
      return NextResponse.json(
        { error: "PC сборка не найдена" },
        { status: 404 }
      );
    }

    // Получение всех FPS метрик для этой сборки
    const metrics = await db.fpsMetric.findMany({
      where: { pcId },
      orderBy: [
        { game: "asc" },
        { resolution: "asc" },
      ],
    });

    return NextResponse.json({
      data: metrics,
      pcBuild: {
        id: pcBuild.id,
        title: pcBuild.title,
      },
    });
  } catch (error) {
    console.error("[FPS_METRICS_GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить FPS метрики" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pcs/[id]/fps
 * Создание новой FPS метрики для конкретной PC сборки
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pcId } = await params;
    const body = await request.json();

    // Проверка существования PC сборки
    const pcBuild = await db.pcBuild.findUnique({
      where: { id: pcId },
      select: { id: true },
    });

    if (!pcBuild) {
      return NextResponse.json(
        { error: "PC сборка не найдена" },
        { status: 404 }
      );
    }

    // Валидация данных
    const validated = fpsMetricFormSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validated.error.errors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Проверка уникальности (pcId + resolution + game)
    const existingMetric = await db.fpsMetric.findUnique({
      where: {
        pcId_resolution_game: {
          pcId,
          resolution: data.resolution,
          game: data.game,
        },
      },
    });

    if (existingMetric) {
      return NextResponse.json(
        {
          error: `Метрика для игры "${data.game}" с разрешением ${data.resolution} уже существует для этого PC`,
        },
        { status: 409 }
      );
    }

    // Создание новой метрики
    const metric = await db.fpsMetric.create({
      data: {
        pcId,
        game: data.game,
        resolution: data.resolution,
        fpsMin: data.fpsMin ?? null,
        fpsAvg: data.fpsAvg,
        fpsP95: data.fpsP95 ?? null,
      },
    });

    return NextResponse.json({ data: metric }, { status: 201 });
  } catch (error) {
    console.error("[FPS_METRIC_CREATE]", error);
    return NextResponse.json(
      { error: "Не удалось создать FPS метрику" },
      { status: 500 }
    );
  }
}
