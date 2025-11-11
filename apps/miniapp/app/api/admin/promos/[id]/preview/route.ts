import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { calculatePromoPrice } from "@/lib/validations/promo-campaigns";

/**
 * Preview Item Type
 */
type PreviewItem = {
  id: string;
  type: "PC" | "DEVICE";
  title: string;
  originalPrice: number;
  promoPrice: number;
  discount: number; // В процентах
  savings: number; // В рублях
};

/**
 * GET /api/admin/promos/[id]/preview
 * Предпросмотр товаров, попадающих под промо-кампанию
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Получение промо-кампании
    const campaign = await db.promoCampaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        rules: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Промо-кампания не найдена" },
        { status: 404 }
      );
    }

    const rules = campaign.rules as {
      type: "percentOff" | "fixedOff" | "fixedPrice";
      value: number;
      minPrice?: number;
      maxPrice?: number;
      tags?: string[];
    };

    const affectedItems: PreviewItem[] = [];

    // ====================================================================
    // PC Builds
    // ====================================================================

    const pcBuilds = await db.pcBuild.findMany({
      where: {
        // Фильтр по диапазону цен
        priceBase: {
          ...(rules.minPrice ? { gte: rules.minPrice } : {}),
          ...(rules.maxPrice ? { lte: rules.maxPrice } : {}),
        },
        // TODO: Фильтр по тегам (когда будет реализовано в schema)
      },
      select: {
        id: true,
        title: true,
        priceBase: true,
        badges: true,
      },
      orderBy: {
        priceBase: "desc",
      },
    });

    for (const pcBuild of pcBuilds) {
      const promoPrice = calculatePromoPrice(pcBuild.priceBase, rules);

      if (promoPrice !== null) {
        const savings = pcBuild.priceBase - promoPrice;
        const discount = Math.round((savings / pcBuild.priceBase) * 100);

        affectedItems.push({
          id: pcBuild.id,
          type: "PC",
          title: pcBuild.title,
          originalPrice: pcBuild.priceBase,
          promoPrice,
          discount,
          savings,
        });
      }
    }

    // ====================================================================
    // Devices
    // ====================================================================

    const devices = await db.device.findMany({
      where: {
        // Фильтр по диапазону цен
        price: {
          ...(rules.minPrice ? { gte: rules.minPrice } : {}),
          ...(rules.maxPrice ? { lte: rules.maxPrice } : {}),
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
        badges: true,
      },
      orderBy: {
        price: "desc",
      },
    });

    for (const device of devices) {
      const promoPrice = calculatePromoPrice(device.price, rules);

      if (promoPrice !== null) {
        const savings = device.price - promoPrice;
        const discount = Math.round((savings / device.price) * 100);

        affectedItems.push({
          id: device.id,
          type: "DEVICE",
          title: device.title,
          originalPrice: device.price,
          promoPrice,
          discount,
          savings,
        });
      }
    }

    // Статистика
    const stats = {
      total: affectedItems.length,
      pcBuilds: affectedItems.filter((item) => item.type === "PC").length,
      devices: affectedItems.filter((item) => item.type === "DEVICE").length,
      averageDiscount:
        affectedItems.length > 0
          ? Math.round(
              affectedItems.reduce((sum, item) => sum + item.discount, 0) /
                affectedItems.length
            )
          : 0,
      totalSavings: affectedItems.reduce(
        (sum, item) => sum + item.savings,
        0
      ),
    };

    return NextResponse.json({
      data: {
        campaign: {
          id: campaign.id,
          title: campaign.title,
          rules,
        },
        items: affectedItems,
        stats,
      },
    });
  } catch (error) {
    console.error("[Promo Preview API] GET Error:", error);

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
