import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categoryFormSchema } from "@/lib/validations/categories";

/**
 * GET /api/admin/categories/[id]
 * Получение одной категории по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить категорию" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/categories/[id]
 * Обновление категории
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Проверка существования категории
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    // Валидация
    const validated = categoryFormSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: validated.error.errors },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Проверка уникальности slug (если изменился)
    if (data.slug !== existingCategory.slug) {
      const slugExists = await db.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: `Категория с slug "${data.slug}" уже существует` },
          { status: 409 }
        );
      }
    }

    // Проверка kind: нельзя менять если есть children или связанные entities
    if (data.kind !== existingCategory.kind) {
      if (existingCategory.children.length > 0) {
        return NextResponse.json(
          { error: "Нельзя изменить тип категории с подкатегориями" },
          { status: 400 }
        );
      }

      // Проверка связанных PC Builds
      const pcsCount = await db.pcBuild.count({
        where: { categoryId: id },
      });
      if (pcsCount > 0) {
        return NextResponse.json(
          { error: "Нельзя изменить тип категории, используемой в PC Builds" },
          { status: 400 }
        );
      }

      // Проверка связанных Devices
      const devicesCount = await db.device.count({
        where: { categoryId: id },
      });
      if (devicesCount > 0) {
        return NextResponse.json(
          { error: "Нельзя изменить тип категории, используемой в Devices" },
          { status: 400 }
        );
      }
    }

    // Проверка parentId
    if (data.parentId) {
      // Нельзя установить саму себя как родителя
      if (data.parentId === id) {
        return NextResponse.json(
          { error: "Категория не может быть родителем самой себе" },
          { status: 400 }
        );
      }

      // Проверка существования родителя и совпадения kind
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

    // Обновление категории
    const category = await db.category.update({
      where: { id },
      data: {
        slug: data.slug,
        kind: data.kind,
        title: data.title,
        parentId: data.parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return NextResponse.json(
      { error: "Не удалось обновить категорию" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Удаление категории
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверка существования категории
    const category = await db.category.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Категория не найдена" },
        { status: 404 }
      );
    }

    // Проверка наличия дочерних категорий
    if (category.children.length > 0) {
      return NextResponse.json(
        {
          error: `Нельзя удалить категорию с подкатегориями (найдено: ${category.children.length})`,
        },
        { status: 400 }
      );
    }

    // Проверка связанных PC Builds
    if (category.kind === "PC") {
      const pcsCount = await db.pcBuild.count({
        where: { categoryId: id },
      });

      if (pcsCount > 0) {
        return NextResponse.json(
          {
            error: `Категория используется в ${pcsCount} PC Builds. Удалите или переместите их сначала.`,
          },
          { status: 400 }
        );
      }
    }

    // Проверка связанных Devices
    if (category.kind === "DEVICE") {
      const devicesCount = await db.device.count({
        where: { categoryId: id },
      });

      if (devicesCount > 0) {
        return NextResponse.json(
          {
            error: `Категория используется в ${devicesCount} Devices. Удалите или переместите их сначала.`,
          },
          { status: 400 }
        );
      }
    }

    // Удаление категории
    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return NextResponse.json(
      { error: "Не удалось удалить категорию" },
      { status: 500 }
    );
  }
}
