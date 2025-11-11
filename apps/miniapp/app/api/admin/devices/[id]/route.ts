import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deviceFormSchema } from "@/lib/validations/devices";

/**
 * GET /api/admin/devices/[id]
 * Получение одного девайса по ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const device = await db.device.findUnique({
      where: { id },
      include: {
        category: true,
        coverImage: true,
        gallery: true,
      },
    });

    if (!device) {
      return NextResponse.json(
        { error: "Девайс не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: device });
  } catch (error) {
    console.error("[DEVICE_GET]", error);
    return NextResponse.json(
      { error: "Не удалось загрузить девайс" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/devices/[id]
 * Обновление девайса
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Проверка существования девайса
    const existingDevice = await db.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      return NextResponse.json(
        { error: "Девайс не найден" },
        { status: 404 }
      );
    }

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

    // Проверка уникальности slug (кроме текущего девайса)
    if (data.slug !== existingDevice.slug) {
      const slugExists = await db.device.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Девайс с таким slug уже существует" },
          { status: 409 }
        );
      }
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

    // Обновление девайса
    const device = await db.device.update({
      where: { id },
      data: {
        slug: data.slug,
        categoryId: data.categoryId,
        title: data.title,
        price: data.price,
        coverImageId: data.coverImageId || existingDevice.coverImageId,
        badges: data.badges,
        isTop: data.isTop,
      },
      include: {
        category: true,
        coverImage: true,
        gallery: true,
      },
    });

    return NextResponse.json({ data: device });
  } catch (error) {
    console.error("[DEVICE_PATCH]", error);
    return NextResponse.json(
      { error: "Не удалось обновить девайс" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/devices/[id]
 * Удаление девайса
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Проверка существования девайса
    const existingDevice = await db.device.findUnique({
      where: { id },
    });

    if (!existingDevice) {
      return NextResponse.json(
        { error: "Девайс не найден" },
        { status: 404 }
      );
    }

    // Удаление девайса (cascade удаление priceHistory)
    await db.device.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DEVICE_DELETE]", error);
    return NextResponse.json(
      { error: "Не удалось удалить девайс" },
      { status: 500 }
    );
  }
}
