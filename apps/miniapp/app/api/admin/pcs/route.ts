import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  createPCBuildSchema,
  pcBuildQuerySchema,
} from "@/lib/validations/pc-builds";

/**
 * GET /api/admin/pcs
 * Получение списка PC Builds с фильтрацией, пагинацией и сортировкой
 */
export async function GET(request: NextRequest) {
  try {
    // Парсим query параметры
    const { searchParams } = new URL(request.url);
    const queryObject = Object.fromEntries(searchParams.entries());

    // Валидация query параметров
    const validated = pcBuildQuerySchema.safeParse(queryObject);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Некорректные параметры запроса",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      search,
      minPrice,
      maxPrice,
      targets,
      availability,
      isTop,
      page,
      limit,
      sortBy,
      sortOrder,
    } = validated.data;

    // Формируем WHERE условие
    const where: Prisma.PcBuildWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { subtitle: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(minPrice !== undefined && { priceBase: { gte: minPrice } }),
      ...(maxPrice !== undefined && { priceBase: { lte: maxPrice } }),
      ...(targets && targets.length > 0 && { targets: { hasSome: targets } }),
      ...(availability && { availability }),
      ...(isTop !== undefined && { isTop }),
    };

    // Формируем ORDER BY
    const orderBy: Prisma.PcBuildOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: "desc" };

    // Выполняем запросы параллельно
    const [data, total] = await Promise.all([
      db.pcBuild.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          coverImage: {
            select: {
              id: true,
              key: true,
              blurhash: true,
              avgColor: true,
              alt: true,
            },
          },
          video: {
            select: {
              id: true,
              key: true,
            },
          },
          gallery: {
            select: {
              id: true,
              key: true,
              blurhash: true,
              avgColor: true,
              alt: true,
            },
          },
        },
      }),
      db.pcBuild.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[PC Builds API] GET Error:", error);

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
 * POST /api/admin/pcs
 * Создание нового PC Build
 */
export async function POST(request: NextRequest) {
  try {
    // Парсим body
    const body = await request.json();

    // Валидация данных
    const validated = createPCBuildSchema.safeParse(body);

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
    const existingSlug = await db.pcBuild.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "PC Build с таким slug уже существует" },
        { status: 409 }
      );
    }

    // Проверка существования coverImage (только если указан)
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

    // Проверка существования videoId (если указан)
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

    // Проверка существования gallery images (если указаны)
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

    // Создание PC Build
    const pcBuild = await db.pcBuild.create({
      data: {
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle,
        coverImageId: data.coverImageId,
        videoId: data.videoId,
        priceBase: data.priceBase,
        targets: data.targets,
        spec: data.spec,
        options: data.options,
        isTop: data.isTop ?? false,
        badges: data.badges ?? [],
        availability: data.availability ?? "IN_STOCK",
        ...(data.gallery &&
          data.gallery.length > 0 && {
            gallery: {
              connect: data.gallery.map((id) => ({ id })),
            },
          }),
      },
      include: {
        coverImage: true,
        gallery: true,
        video: true,
      },
    });

    return NextResponse.json({ data: pcBuild }, { status: 201 });
  } catch (error) {
    console.error("[PC Builds API] POST Error:", error);

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
          { error: "Связанная запись не найдена" },
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
