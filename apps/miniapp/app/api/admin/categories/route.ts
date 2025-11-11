import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categoryFormSchema } from "@/lib/validations/categories";

/**
 * GET /api/admin/categories
 * Получение всех категорий
 * Query params: ?kind=DEVICE или ?kind=PC для фильтрации
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind");

    const categories = await db.category.findMany({
      where: kind ? { kind: kind as "PC" | "DEVICE" } : undefined,
      include: {
        parent: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить категории" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Создание новой категории
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Валидация с помощью Zod
    const validated = categoryFormSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validated.error.errors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Проверка уникальности slug
    const existingSlug = await db.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: `Категория с slug "${data.slug}" уже существует` },
        { status: 409 }
      );
    }

    // Если указан parentId, проверяем что родитель существует и того же kind
    if (data.parentId) {
      const parent = await db.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        return NextResponse.json(
          { error: "Родительская категория не найдена" },
          { status: 404 }
        );
      }

      if (parent.kind !== data.kind) {
        return NextResponse.json(
          { error: "Родительская категория должна быть того же типа (PC/DEVICE)" },
          { status: 400 }
        );
      }
    }

    // Создание категории
    const category = await db.category.create({
      data: {
        slug: data.slug,
        kind: data.kind,
        title: data.title,
        parentId: data.parentId || null,
      },
      include: {
        parent: true,
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return NextResponse.json(
      { error: "Не удалось создать категорию" },
      { status: 500 }
    );
  }
}
