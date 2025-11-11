import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { z } from "zod";

/**
 * Settings Update Schema
 * Валидация для обновления настроек
 */
const updateSettingsSchema = z.object({
  topPcIds: z
    .array(z.string().cuid("Некорректный ID сборки"))
    .max(4, "Максимум 4 сборки в Top списке")
    .optional(),

  topDeviceIds: z
    .array(z.string().cuid("Некорректный ID устройства"))
    .max(4, "Максимум 4 устройства в Top списке")
    .optional(),

  budgetPresets: z
    .array(
      z.tuple([
        z.number().int().positive("Минимальная цена должна быть положительной"),
        z.number().int().positive("Максимальная цена должна быть положительной"),
      ])
    )
    .min(1, "Необходим хотя бы один пресет")
    .max(10, "Максимум 10 пресетов")
    .optional(),

  telegraph: z
    .object({
      privacy: z.string().url("Некорректный URL").optional().or(z.literal("")),
      offer: z.string().url("Некорректный URL").optional().or(z.literal("")),
      pd_consent: z.string().url("Некорректный URL").optional().or(z.literal("")),
      review_consent: z.string().url("Некорректный URL").optional().or(z.literal("")),
      faq: z.string().url("Некорректный URL").optional().or(z.literal("")),
    })
    .optional(),
});

/**
 * GET /api/admin/settings
 * Получение текущих настроек
 */
export async function GET() {
  try {
    let settings = await db.settings.findUnique({
      where: { id: "singleton" },
    });

    // Если настроек нет - создаём дефолтные
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

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("[Settings API] GET Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Ошибка базы данных" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/settings
 * Обновление настроек
 */
export async function PATCH(request: NextRequest) {
  try {
    // Парсим body
    const body = await request.json();

    // Валидация данных
    const validated = updateSettingsSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Проверка существования PC Builds (если обновляются)
    if (data.topPcIds && data.topPcIds.length > 0) {
      const pcBuilds = await db.pcBuild.findMany({
        where: { id: { in: data.topPcIds } },
        select: { id: true },
      });

      if (pcBuilds.length !== data.topPcIds.length) {
        return NextResponse.json(
          { error: "Некоторые PC Builds не найдены" },
          { status: 404 }
        );
      }
    }

    // Проверка существования Devices (если обновляются)
    if (data.topDeviceIds && data.topDeviceIds.length > 0) {
      const devices = await db.device.findMany({
        where: { id: { in: data.topDeviceIds } },
        select: { id: true },
      });

      if (devices.length !== data.topDeviceIds.length) {
        return NextResponse.json(
          { error: "Некоторые Devices не найдены" },
          { status: 404 }
        );
      }
    }

    // Валидация budget presets (если обновляются)
    if (data.budgetPresets) {
      for (const [min, max] of data.budgetPresets) {
        if (max <= min) {
          return NextResponse.json(
            {
              error: "Максимальная цена должна быть больше минимальной в каждом пресете",
            },
            { status: 400 }
          );
        }
      }
    }

    // Подготовка данных для обновления
    const updateData: Prisma.SettingsUpdateInput = {};

    if (data.topPcIds !== undefined) {
      updateData.topPcIds = data.topPcIds;
    }

    if (data.topDeviceIds !== undefined) {
      updateData.topDeviceIds = data.topDeviceIds;
    }

    if (data.budgetPresets !== undefined) {
      updateData.budgetPresets = data.budgetPresets as Prisma.InputJsonValue;
    }

    if (data.telegraph !== undefined) {
      updateData.telegraph = data.telegraph as Prisma.InputJsonValue;
    }

    // Обновление настроек
    const updatedSettings = await db.settings.upsert({
      where: { id: "singleton" },
      update: updateData,
      create: {
        id: "singleton",
        topPcIds: data.topPcIds || [],
        topDeviceIds: data.topDeviceIds || [],
        budgetPresets: (data.budgetPresets || [
          [46000, 100000],
          [100000, 150000],
          [150000, 225000],
          [225000, 300000],
          [300000, 500000],
        ]) as Prisma.InputJsonValue,
        telegraph: (data.telegraph || {
          privacy: "",
          offer: "",
          pd_consent: "",
          review_consent: "",
          faq: "",
        }) as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ data: updatedSettings });
  } catch (error) {
    console.error("[Settings API] PATCH Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Настройки не найдены" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
