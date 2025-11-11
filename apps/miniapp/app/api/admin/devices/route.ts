import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deviceFormSchema } from "@/lib/validations/devices";

/**
 * GET /api/admin/devices
 * Получение всех девайсов с категориями и обложками
 */
export async function GET(request: NextRequest) {
  try {
    const devices = await db.device.findMany({
      include: {
        category: true,
        coverImage: true,
      },
      orderBy: [
        { isTop: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ data: devices });
  } catch (error) {
    console.error("[DEVICES_GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить девайсы" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/devices
 * Создание нового девайса
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация с Zod
    const validated = deviceFormSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Ошибка валидации",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Проверка уникальности slug
    const existingSlug = await db.device.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Девайс с таким slug уже существует" },
        { status: 409 }
      );
    }

    // Проверка существования категории
    const categoryExists = await db.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    // Создание девайса
    const device = await db.device.create({
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        title: data.title,
        price: data.price,
        coverImageId: data.coverImageId || "", // Placeholder пока нет Media Library
        badges: data.badges,
        isTop: data.isTop,
      },
      include: {
        category: true,
        coverImage: true,
      },
    });

    return NextResponse.json({ data: device }, { status: 201 });
  } catch (error) {
    console.error("[DEVICES_POST]", error);
    return NextResponse.json(
      { error: "Не удалось создать девайс" },
      { status: 500 }
    );
  }
}
