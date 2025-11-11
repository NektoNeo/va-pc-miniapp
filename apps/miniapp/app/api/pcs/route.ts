import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { PCListResponse } from "@/types/pc";
import { withTelegramAuth, type TelegramAuthRequest } from "@/lib/middleware/telegram-auth";
import { Resolution } from "@prisma/client";

async function handler(request: TelegramAuthRequest) {
  const { searchParams } = new URL(request.url);

  // Budget filter params
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // Quality filter
  const quality = searchParams.get("quality");

  // Search query
  const search = searchParams.get("search");

  // Build Prisma where clause
  const where: any = {};

  // Apply budget filter
  if (minPrice || maxPrice) {
    where.priceBase = {};
    if (minPrice) where.priceBase.gte = Number(minPrice);
    if (maxPrice) where.priceBase.lte = Number(maxPrice);
  }

  // Apply quality filter (resolution)
  if (quality && quality !== "ALL") {
    const resolutionMap: Record<string, Resolution> = {
      FHD: Resolution.FHD,
      QHD: Resolution.QHD,
      UHD4K: Resolution.UHD4K,
    };
    if (resolutionMap[quality]) {
      where.targets = {
        has: resolutionMap[quality],
      };
    }
  }

  // Apply search filter (search by title, subtitle, and specs)
  if (search && search.trim()) {
    const searchTerm = search.trim();
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { subtitle: { contains: searchTerm, mode: 'insensitive' } },
      // Search in JSON spec field (CPU, GPU, RAM, etc.)
      { spec: { string_contains: searchTerm } },
    ];
  }

  // Fetch PC builds from database
  const pcBuilds = await db.pcBuild.findMany({
    where,
    include: {
      coverImage: true,
    },
    orderBy: [
      { isTop: 'desc' },
      { priceBase: 'asc' }
    ]
  });

  // Transform to frontend format
  const pcs = pcBuilds.map((pc) => ({
    id: pc.id,
    slug: pc.slug,
    title: pc.title,
    subtitle: pc.subtitle || '',
    image: pc.coverImage?.url || '',
    price: pc.priceBase,
    quality: pc.targets.includes(Resolution.UHD4K) ? 'UHD4K' :
            pc.targets.includes(Resolution.QHD) ? 'QHD' : 'FHD',
    specs: [
      (pc.spec as any).cpu || '',
      (pc.spec as any).gpu || '',
      (pc.spec as any).ram || '',
    ].filter(Boolean),
    badges: pc.badges,
    availability: pc.availability,
  }));

  const response: PCListResponse = {
    pcs,
    total: pcs.length,
  };

  return NextResponse.json(response);
}

export const GET = withTelegramAuth(handler);
