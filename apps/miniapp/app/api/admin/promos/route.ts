import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  promoCampaignFormSchema,
  generatePromoSlug,
} from "@/lib/validations/promo-campaigns";

/**
 * GET /api/admin/promos
 * Получение всех промо-кампаний
 */
export async function GET() {
  try {
    const campaigns = await db.promoCampaign.findMany({
      include: {
        bannerImage: {
          select: {
            id: true,
            key: true,
            avgColor: true,
          },
        },
      },
      orderBy: [
        { active: "desc" }, // Активные первыми
        { priority: "desc" }, // Затем по приоритету
        { startsAt: "desc" }, // Затем по дате начала
      ],
    });

    return NextResponse.json({ data: campaigns });
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
 * POST /api/admin/promos
 * Создание новой промо-кампании
 */
export async function POST(request: NextRequest) {
  try {
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

    // Проверка уникальности slug
    const existingSlug = await db.promoCampaign.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Промо-кампания с таким slug уже существует" },
        { status: 409 }
      );
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

    // Создание промо-кампании
    const campaign = await db.promoCampaign.create({
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

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    console.error("[Promo API] POST Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint violation
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Промо-кампания с таким slug уже существует" },
          { status: 409 }
        );
      }

      // P2003: Foreign key constraint (invalid bannerImageId)
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
