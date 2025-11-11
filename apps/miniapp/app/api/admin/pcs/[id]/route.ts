import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { updatePCBuildSchema } from "@/lib/validations/pc-builds";

/**
 * PATCH /api/admin/pcs/[id]
 * Обновление существующего PC Build
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Проверка существования PC Build
    const existing = await db.pcBuild.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "PC Build не найден" },
        { status: 404 }
      );
    }

    // Парсим body
    const body = await request.json();

    // Валидация данных
    const validated = updatePCBuildSchema.safeParse(body);

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

    // Проверка уникальности slug (если обновляется)
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await db.pcBuild.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "PC Build с таким slug уже существует" },
          { status: 409 }
        );
      }
    }

    // Проверка существования coverImage (если обновляется)
    if (data.coverImageId) {
      const coverImage = await db.imageAsset.findUnique({
        where: { id: data.coverImageId },
        select: { id: true },
      });

      if (!coverImage) {
        return NextResponse.json(
          { error: "Обложка не найдена" },
          { status: 404 }
        );
      }
    }

    // Проверка существования videoId (если обновляется)
    if (data.videoId) {
      const video = await db.videoAsset.findUnique({
        where: { id: data.videoId },
        select: { id: true },
      });

      if (!video) {
        return NextResponse.json(
          { error: "Видео не найдено" },
          { status: 404 }
        );
      }
    }

    // Проверка существования gallery images (если обновляется)
    if (data.gallery && data.gallery.length > 0) {
      const galleryImages = await db.imageAsset.findMany({
        where: { id: { in: data.gallery } },
        select: { id: true },
      });

      if (galleryImages.length !== data.gallery.length) {
        return NextResponse.json(
          { error: "Некоторые изображения галереи не найдены" },
          { status: 404 }
        );
      }
    }

    // Подготовка данных для обновления
    const updateData: Prisma.PcBuildUpdateInput = {
      ...(data.slug && { slug: data.slug }),
      ...(data.title && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.coverImageId && { coverImageId: data.coverImageId }),
      ...(data.videoId !== undefined && { videoId: data.videoId }),
      ...(data.priceBase && { priceBase: data.priceBase }),
      ...(data.targets && { targets: data.targets }),
      ...(data.spec && { spec: data.spec }),
      ...(data.options && { options: data.options }),
      ...(data.isTop !== undefined && { isTop: data.isTop }),
      ...(data.badges && { badges: data.badges }),
      ...(data.availability && { availability: data.availability }),
    };

    // Обработка gallery (замена всех связей)
    if (data.gallery) {
      // Сначала отключаем все текущие
      await db.pcBuild.update({
        where: { id },
        data: {
          gallery: {
            set: [], // Очищаем текущие связи
          },
        },
      });

      // Затем подключаем новые
      if (data.gallery.length > 0) {
        updateData.gallery = {
          connect: data.gallery.map((imageId) => ({ id: imageId })),
        };
      }
    }

    // Обновление PC Build
    const updatedPcBuild = await db.pcBuild.update({
      where: { id },
      data: updateData,
      include: {
        coverImage: true,
        gallery: true,
        video: true,
      },
    });

    return NextResponse.json({ data: updatedPcBuild });
  } catch (error) {
    console.error("[PC Builds API] PATCH Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint violation
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Запись с такими данными уже существует" },
          { status: 409 }
        );
      }
      // P2025: Record not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Запись не найдена" },
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

/**
 * DELETE /api/admin/pcs/[id]
 * Удаление PC Build
 * Cascade delete: FpsMetrics, PriceHistory (автоматически через Prisma schema)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Проверка существования PC Build
    const existing = await db.pcBuild.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            fpsMetrics: true,
            priceHistory: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "PC Build не найден" },
        { status: 404 }
      );
    }

    // Удаление PC Build (cascade delete для fpsMetrics и priceHistory)
    await db.pcBuild.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `PC Build "${existing.title}" удалён`,
      cascadeDeleted: {
        fpsMetrics: existing._count.fpsMetrics,
        priceHistory: existing._count.priceHistory,
      },
    });
  } catch (error) {
    console.error("[PC Builds API] DELETE Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Запись не найдена" },
          { status: 404 }
        );
      }
      // P2003: Foreign key constraint failed
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "Невозможно удалить PC Build, так как он используется в других записях",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
