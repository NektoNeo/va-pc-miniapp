import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { promoCampaignFormSchema } from "@/lib/validations/promo-campaigns";

/**
 * GET /api/admin/promos/[id]
 * Получение одной промо-кампании по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await db.promoCampaign.findUnique({
      where: { id },
      include: {
        bannerImage: {
          select: {
            id: true,
            key: true,
            avgColor: true,
            blurhash: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Промо-кампания не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error("[Promo API] GET Error:", error);

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
 * PATCH /api/admin/promos/[id]
 * Обновление промо-кампании
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Валидация данных
    const validated = promoCampaignFormSchema.safeParse(body);

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

    // Проверка существования кампании
    const existing = await db.promoCampaign.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Промо-кампания не найдена" },
        { status: 404 }
      );
    }

    // Проверка уникальности slug (если изменился)
    if (data.slug !== existing.slug) {
      const slugExists = await db.promoCampaign.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Промо-кампания с таким slug уже существует" },
          { status: 409 }
        );
      }
    }

    // Проверка существования bannerImage (если указан)
    if (data.bannerImageId) {
      const image = await db.imageAsset.findUnique({
        where: { id: data.bannerImageId },
        select: { id: true },
      });

      if (!image) {
        return NextResponse.json(
          { error: "Изображение не найдено" },
          { status: 404 }
        );
      }
    }

    // Обновление кампании
    const campaign = await db.promoCampaign.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        active: data.active,
        startsAt: data.startsAt,
        endsAt: data.endsAt || null,
        bannerImageId: data.bannerImageId || null,
        rules: data.rules as Prisma.InputJsonValue,
        priority: data.priority,
      },
      include: {
        bannerImage: {
          select: {
            id: true,
            key: true,
            avgColor: true,
          },
        },
      },
    });

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error("[Promo API] PATCH Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Промо-кампания не найдена" },
          { status: 404 }
        );
      }

      // P2002: Unique constraint violation
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Промо-кампания с таким slug уже существует" },
          { status: 409 }
        );
      }

      // P2003: Foreign key constraint
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Изображение не найдено" },
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
 * DELETE /api/admin/promos/[id]
 * Удаление промо-кампании
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверка существования кампании
    const existing = await db.promoCampaign.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Промо-кампания не найдена" },
        { status: 404 }
      );
    }

    // Удаление кампании
    await db.promoCampaign.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Промо-кампания успешно удалена" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Promo API] DELETE Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2025: Record not found
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Промо-кампания не найдена" },
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
