import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fpsMetricFormSchema } from "@/lib/validations/fps-metrics";

/**
 * PATCH /api/admin/fps/[id]
 * Обновление FPS метрики
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Проверка существования метрики
    const existingMetric = await db.fpsMetric.findUnique({
      where: { id },
    });

    if (!existingMetric) {
      return NextResponse.json(
        { error: "FPS метрика не найдена" },
        { status: 404 }
      );
    }

    // Валидация
    const validated = fpsMetricFormSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validated.error.errors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Проверка уникальности если изменились game или resolution
    if (
      data.game !== existingMetric.game ||
      data.resolution !== existingMetric.resolution
    ) {
      const duplicate = await db.fpsMetric.findUnique({
        where: {
          pcId_resolution_game: {
            pcId: existingMetric.pcId,
            resolution: data.resolution,
            game: data.game,
          },
        },
      });

      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          {
            error: `Метрика для игры "${data.game}" с разрешением ${data.resolution} уже существует для этого PC`,
          },
          { status: 409 }
        );
      }
    }

    // Обновление метрики
    const metric = await db.fpsMetric.update({
      where: { id },
      data: {
        game: data.game,
        resolution: data.resolution,
        fpsMin: data.fpsMin ?? null,
        fpsAvg: data.fpsAvg,
        fpsP95: data.fpsP95 ?? null,
      },
    });

    return NextResponse.json({ data: metric });
  } catch (error) {
    console.error("[FPS_METRIC_PATCH]", error);
    return NextResponse.json(
      { error: "Не удалось обновить FPS метрику" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/fps/[id]
 * Удаление FPS метрики
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверка существования метрики
    const metric = await db.fpsMetric.findUnique({
      where: { id },
    });

    if (!metric) {
      return NextResponse.json(
        { error: "FPS метрика не найдена" },
        { status: 404 }
      );
    }

    // Удаление метрики
    await db.fpsMetric.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FPS_METRIC_DELETE]", error);
    return NextResponse.json(
      { error: "Не удалось удалить FPS метрику" },
      { status: 500 }
    );
  }
}
