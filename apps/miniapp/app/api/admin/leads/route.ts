import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/admin/leads
 *
 * Read-only endpoint для отображения лидов с фильтрацией
 *
 * Query params:
 * - page (number): номер страницы (default: 1)
 * - limit (number): кол-во на странице (default: 20, max: 100)
 * - search (string): поиск по phone, comment, tgUserId
 * - from (ISO date): фильтр по createdAt >= from
 * - to (ISO date): фильтр по createdAt <= to
 * - sortBy (string): поле сортировки (default: createdAt)
 * - sortOrder (asc|desc): порядок сортировки (default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    // Search
    const search = searchParams.get("search")?.trim() || "";

    // Date filters
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { phone: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
        { tgUserId: { contains: search, mode: "insensitive" } },
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        // Include the entire 'to' day
        const toDateObj = new Date(toDate);
        toDateObj.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDateObj;
      }
    }

    // Fetch leads with pagination
    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          tgUserId: true,
          items: true,
          phone: true,
          comment: true,
          createdAt: true,
        },
      }),
      db.lead.count({ where }),
    ]);

    // Calculate stats
    const totalItems = leads.reduce((sum, lead) => {
      const items = lead.items as any[];
      return sum + (Array.isArray(items) ? items.length : 0);
    }, 0);

    const totalRevenue = leads.reduce((sum, lead) => {
      const items = lead.items as any[];
      if (!Array.isArray(items)) return sum;
      return sum + items.reduce((itemSum, item) => itemSum + (item.price || 0), 0);
    }, 0);

    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalLeads: total,
        totalItems,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return NextResponse.json(
      { error: "Не удалось загрузить лиды" },
      { status: 500 }
    );
  }
}
