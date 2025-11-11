/**
 * Type-Safe Prisma Query Examples for VA-PC
 *
 * This file demonstrates common database operations with type safety.
 * All queries are production-ready and optimized with proper indexes.
 */

import { PrismaClient, Resolution, Availability } from '@prisma/client'

const prisma = new PrismaClient()

// ============================================================================
// EXAMPLE 1: Filter PC builds by budget range
// ============================================================================

/**
 * Get PC builds within a specific budget range
 * Uses indexed priceBase field for fast filtering
 */
export async function getPcsByBudgetRange(minPrice: number, maxPrice: number) {
  const pcs = await prisma.pcBuild.findMany({
    where: {
      priceBase: {
        gte: minPrice,
        lte: maxPrice,
      },
      availability: Availability.IN_STOCK, // Only show available PCs
    },
    include: {
      coverImage: {
        select: {
          key: true,
          bucket: true,
          blurhash: true,
          avgColor: true,
          alt: true,
        },
      },
      gallery: {
        select: {
          key: true,
          bucket: true,
          width: true,
          height: true,
        },
        take: 5, // Limit gallery images for performance
      },
      fpsMetrics: {
        where: {
          resolution: Resolution.FHD, // Default to FHD metrics
        },
        orderBy: {
          fpsAvg: 'desc',
        },
        take: 5, // Top 5 games
      },
    },
    orderBy: {
      priceBase: 'asc', // Cheapest first
    },
  })

  return pcs
}

// ============================================================================
// EXAMPLE 2: Get product with computed final price (with options)
// ============================================================================

interface SelectedOptions {
  ram?: number // RAM size in GB
  ssd?: number // SSD size in GB
}

/**
 * Get PC build with final price calculation based on selected options
 */
export async function getPcWithFinalPrice(slug: string, options: SelectedOptions) {
  const pc = await prisma.pcBuild.findUnique({
    where: { slug },
    include: {
      coverImage: true,
      gallery: true,
      video: true,
      fpsMetrics: {
        orderBy: [
          { resolution: 'asc' },
          { fpsAvg: 'desc' },
        ],
      },
    },
  })

  if (!pc) {
    throw new Error(`PC build with slug "${slug}" not found`)
  }

  // Calculate final price based on options
  let finalPrice = pc.priceBase

  // Parse options from JSON
  const pcOptions = pc.options as {
    ram?: Array<{ label: string; sizeGb: number; delta: number }>
    ssd?: Array<{ label: string; sizeGb: number; delta: number }>
  }

  // Add RAM option delta
  if (options.ram && pcOptions.ram) {
    const ramOption = pcOptions.ram.find((opt) => opt.sizeGb === options.ram)
    if (ramOption) {
      finalPrice += ramOption.delta
    }
  }

  // Add SSD option delta
  if (options.ssd && pcOptions.ssd) {
    const ssdOption = pcOptions.ssd.find((opt) => opt.sizeGb === options.ssd)
    if (ssdOption) {
      finalPrice += ssdOption.delta
    }
  }

  return {
    ...pc,
    finalPrice,
    selectedOptions: options,
  }
}

// ============================================================================
// EXAMPLE 3: Get product with active promo price
// ============================================================================

/**
 * Get PC build with active promotional pricing
 * Checks if current time is within promo campaign period
 */
export async function getPcWithPromoPrice(pcId: string) {
  const now = new Date()

  const pc = await prisma.pcBuild.findUnique({
    where: { id: pcId },
    include: {
      coverImage: true,
      priceHistory: {
        where: {
          startsAt: { lte: now },
          OR: [
            { endsAt: { gte: now } },
            { endsAt: null }, // No end date
          ],
        },
        orderBy: {
          startsAt: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!pc) {
    throw new Error(`PC build with ID "${pcId}" not found`)
  }

  const activePriceEntry = pc.priceHistory[0]
  const hasPromo = activePriceEntry?.promoPrice !== null

  return {
    ...pc,
    currentPrice: hasPromo ? activePriceEntry.promoPrice! : pc.priceBase,
    originalPrice: pc.priceBase,
    discount: hasPromo
      ? Math.round(((pc.priceBase - activePriceEntry.promoPrice!) / pc.priceBase) * 100)
      : 0,
    hasActivePromo: hasPromo,
  }
}

// ============================================================================
// EXAMPLE 4: Get Top-4 products
// ============================================================================

/**
 * Get Top-4 featured PC builds based on Settings configuration
 */
export async function getTopPcs() {
  const settings = await prisma.settings.findUnique({
    where: { id: 'singleton' },
  })

  if (!settings || settings.topPcIds.length === 0) {
    // Fallback to isTop flag if settings not configured
    return prisma.pcBuild.findMany({
      where: {
        isTop: true,
        availability: {
          not: Availability.OUT_OF_STOCK,
        },
      },
      include: {
        coverImage: {
          select: {
            key: true,
            bucket: true,
            blurhash: true,
            avgColor: true,
          },
        },
        fpsMetrics: {
          where: {
            resolution: Resolution.FHD,
          },
          take: 3,
        },
      },
      take: 4,
      orderBy: {
        priceBase: 'asc',
      },
    })
  }

  // Get PCs in the order specified by settings
  const pcs = await prisma.pcBuild.findMany({
    where: {
      id: { in: settings.topPcIds.slice(0, 4) },
    },
    include: {
      coverImage: {
        select: {
          key: true,
          bucket: true,
          blurhash: true,
          avgColor: true,
        },
      },
      fpsMetrics: {
        where: {
          resolution: Resolution.FHD,
        },
        take: 3,
      },
    },
  })

  // Sort by settings order
  return settings.topPcIds
    .slice(0, 4)
    .map((id) => pcs.find((pc) => pc.id === id))
    .filter(Boolean)
}

// ============================================================================
// EXAMPLE 5: Search PCs with filters
// ============================================================================

interface SearchFilters {
  minPrice?: number
  maxPrice?: number
  resolution?: Resolution
  minFps?: number
  badges?: string[]
  availability?: Availability[]
}

/**
 * Advanced search with multiple filters
 */
export async function searchPcs(filters: SearchFilters) {
  const { minPrice, maxPrice, resolution, minFps, badges, availability } = filters

  const pcs = await prisma.pcBuild.findMany({
    where: {
      ...(minPrice && { priceBase: { gte: minPrice } }),
      ...(maxPrice && { priceBase: { lte: maxPrice } }),
      ...(resolution && { targets: { has: resolution } }),
      ...(badges && badges.length > 0 && {
        badges: {
          hasSome: badges,
        },
      }),
      ...(availability && {
        availability: {
          in: availability,
        },
      }),
      ...(minFps && resolution && {
        fpsMetrics: {
          some: {
            resolution,
            fpsAvg: { gte: minFps },
          },
        },
      }),
    },
    include: {
      coverImage: true,
      fpsMetrics: {
        where: resolution ? { resolution } : undefined,
        orderBy: {
          fpsAvg: 'desc',
        },
        take: 5,
      },
    },
    orderBy: [
      { isTop: 'desc' }, // Featured first
      { priceBase: 'asc' },
    ],
  })

  return pcs
}

// ============================================================================
// EXAMPLE 6: Get active promo campaigns
// ============================================================================

/**
 * Get all active promotional campaigns
 */
export async function getActivePromoCampaigns() {
  const now = new Date()

  const campaigns = await prisma.promoCampaign.findMany({
    where: {
      active: true,
      startsAt: { lte: now },
      OR: [
        { endsAt: { gte: now } },
        { endsAt: null },
      ],
    },
    include: {
      bannerImage: {
        select: {
          key: true,
          bucket: true,
          width: true,
          height: true,
          blurhash: true,
        },
      },
    },
    orderBy: {
      priority: 'desc', // Highest priority first
    },
  })

  return campaigns
}

// ============================================================================
// EXAMPLE 7: Create a lead (customer inquiry)
// ============================================================================

interface LeadData {
  tgUserId: string
  items: Array<{
    pcId: string
    options: SelectedOptions
    price: number
  }>
  phone?: string
  comment?: string
}

/**
 * Create a new customer lead
 */
export async function createLead(data: LeadData) {
  const lead = await prisma.lead.create({
    data: {
      tgUserId: data.tgUserId,
      items: data.items,
      phone: data.phone,
      comment: data.comment,
    },
  })

  return lead
}

// ============================================================================
// EXAMPLE 8: Get budget presets for filters
// ============================================================================

/**
 * Get budget range presets from settings
 */
export async function getBudgetPresets() {
  const settings = await prisma.settings.findUnique({
    where: { id: 'singleton' },
  })

  if (!settings) {
    // Default budget ranges if settings not found
    return [
      [46000, 100000],
      [100000, 150000],
      [150000, 225000],
      [225000, 300000],
      [300000, 500000],
    ]
  }

  return settings.budgetPresets as number[][]
}

// ============================================================================
// EXAMPLE 9: Get PC with FPS comparison across resolutions
// ============================================================================

/**
 * Get PC with FPS metrics grouped by resolution for comparison
 */
export async function getPcWithFpsComparison(slug: string) {
  const pc = await prisma.pcBuild.findUnique({
    where: { slug },
    include: {
      coverImage: true,
      gallery: true,
      fpsMetrics: {
        orderBy: [
          { game: 'asc' },
          { resolution: 'asc' },
        ],
      },
    },
  })

  if (!pc) {
    throw new Error(`PC build with slug "${slug}" not found`)
  }

  // Group FPS metrics by game
  const fpsByGame = pc.fpsMetrics.reduce((acc, metric) => {
    if (!acc[metric.game]) {
      acc[metric.game] = {}
    }
    acc[metric.game][metric.resolution] = {
      min: metric.fpsMin,
      avg: metric.fpsAvg,
      p95: metric.fpsP95,
    }
    return acc
  }, {} as Record<string, Record<Resolution, { min: number | null; avg: number; p95: number | null }>>)

  return {
    ...pc,
    fpsByGame,
  }
}

// ============================================================================
// EXAMPLE 10: Get devices by category
// ============================================================================

/**
 * Get devices filtered by category with pagination
 */
export async function getDevicesByCategory(categorySlug: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where: {
        category: {
          title: categorySlug, // In real app, you'd search by slug
        },
      },
      include: {
        coverImage: {
          select: {
            key: true,
            bucket: true,
            blurhash: true,
            avgColor: true,
          },
        },
        category: {
          select: {
            title: true,
            kind: true,
          },
        },
      },
      orderBy: [
        { isTop: 'desc' },
        { price: 'asc' },
      ],
      skip,
      take: limit,
    }),
    prisma.device.count({
      where: {
        category: {
          title: categorySlug,
        },
      },
    }),
  ])

  return {
    devices,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

// ============================================================================
// Usage Examples
// ============================================================================

async function runExamples() {
  console.log('Running Prisma query examples...\n')

  try {
    // Example 1: Get PCs in budget range 100k-150k
    console.log('1️⃣ PCs in 100k-150k range:')
    const budgetPcs = await getPcsByBudgetRange(100000, 150000)
    console.log(`Found ${budgetPcs.length} PCs\n`)

    // Example 2: Get PC with custom options
    console.log('2️⃣ PC with custom RAM/SSD options:')
    const customPc = await getPcWithFinalPrice('gaming-beast-pro', {
      ram: 64,
      ssd: 4096,
    })
    console.log(`Final price: ${customPc.finalPrice} RUB\n`)

    // Example 3: Get Top-4 PCs
    console.log('3️⃣ Top-4 featured PCs:')
    const topPcs = await getTopPcs()
    console.log(`Found ${topPcs.length} top PCs\n`)

    // Example 4: Search with filters
    console.log('4️⃣ Search: 4K capable, 80+ FPS:')
    const searchResults = await searchPcs({
      resolution: Resolution.UHD4K,
      minFps: 80,
      availability: [Availability.IN_STOCK],
    })
    console.log(`Found ${searchResults.length} matching PCs\n`)

    // Example 5: Get budget presets
    console.log('5️⃣ Budget presets:')
    const presets = await getBudgetPresets()
    console.log(presets, '\n')

    console.log('✅ All examples completed successfully!')
  } catch (error) {
    console.error('❌ Error running examples:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Uncomment to run examples:
// runExamples()
