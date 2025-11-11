# Prisma Database Usage Guide

## Quick Start

### 1. Setup Database Connection

Create `.env.local` in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/vapc_db?schema=public"
```

### 2. Generate Prisma Client

```bash
cd apps/miniapp
pnpm db:generate
```

### 3. Create Database and Run Migrations

```bash
pnpm db:push
# or for production
pnpm db:migrate
```

### 4. Seed Demo Data

```bash
pnpm db:seed
```

### 5. Open Prisma Studio (Database GUI)

```bash
pnpm db:studio
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client types |
| `pnpm db:push` | Push schema changes to DB (dev) |
| `pnpm db:migrate` | Create migration files |
| `pnpm db:seed` | Populate DB with demo data |
| `pnpm db:studio` | Open Prisma Studio GUI |
| `pnpm db:reset` | Reset DB and re-run migrations |

---

## Database Schema Overview

### Core Entities

#### **PcBuild** - Gaming PC Configurations
- **Fields**: slug, title, subtitle, priceBase, targets (resolutions), spec (JSON), options (JSON)
- **Relations**: coverImage, gallery (ImageAsset[]), video (VideoAsset), fpsMetrics (FpsMetric[])
- **Indexes**: slug (unique), priceBase, isTop, availability

#### **Device** - Peripherals & Accessories
- **Fields**: slug, title, price, categoryId, badges, isTop
- **Relations**: coverImage, gallery (ImageAsset[]), category (Category)

#### **ImageAsset** - Media Files
- **Fields**: bucket, key, mime, width, height, format, blurhash, avgColor
- **Usage**: Covers and galleries for PCs and Devices

#### **VideoAsset** - Video Demos
- **Fields**: bucket, key, mime, width, height, durationSec
- **Usage**: Optional video demonstrations for PC builds

#### **Category** - Product Categories
- **Fields**: kind (PC|DEVICE), title, parentId (for hierarchy)
- **Self-reference**: Supports nested categories

#### **FpsMetric** - Performance Benchmarks
- **Fields**: pcId, game, resolution, fpsMin, fpsAvg, fpsP95
- **Unique**: (pcId, resolution, game) - one metric per PC/resolution/game combo

#### **PriceHistory** - Price Tracking
- **Fields**: entityType (PC|DEVICE), entityId, price, promoPrice, startsAt, endsAt
- **Usage**: Track price changes and promotions over time

#### **PromoCampaign** - Marketing Campaigns
- **Fields**: title, slug, description, active, startsAt, endsAt, rules (JSON), priority
- **Usage**: Configure promotional campaigns with flexible rules

#### **Settings** - Global Configuration (Singleton)
- **Fields**: topPcIds, topDeviceIds, budgetPresets (JSON), telegraph (JSON)
- **ID**: Always "singleton" - only one record

#### **Lead** - Customer Inquiries
- **Fields**: tgUserId, items (JSON), phone, comment
- **Usage**: Store customer cart/inquiry data

---

## Common Queries

### 1. Get PCs by Budget Range

```typescript
import { prisma } from '@/lib/db'

const pcs = await prisma.pcBuild.findMany({
  where: {
    priceBase: {
      gte: 100000,
      lte: 150000,
    },
    availability: 'IN_STOCK',
  },
  include: {
    coverImage: true,
    fpsMetrics: {
      where: { resolution: 'FHD' },
    },
  },
})
```

### 2. Get PC with Calculated Final Price

```typescript
const pc = await prisma.pcBuild.findUnique({
  where: { slug: 'gaming-beast-pro' },
})

const options = pc.options as {
  ram: Array<{ sizeGb: number; delta: number }>
  ssd: Array<{ sizeGb: number; delta: number }>
}

// Calculate final price with selected options
const selectedRam = options.ram.find(o => o.sizeGb === 64)
const selectedSsd = options.ssd.find(o => o.sizeGb === 4096)
const finalPrice = pc.priceBase + (selectedRam?.delta || 0) + (selectedSsd?.delta || 0)
```

### 3. Get Active Promo Campaigns

```typescript
const now = new Date()

const promos = await prisma.promoCampaign.findMany({
  where: {
    active: true,
    startsAt: { lte: now },
    OR: [
      { endsAt: { gte: now } },
      { endsAt: null },
    ],
  },
  orderBy: {
    priority: 'desc',
  },
})
```

### 4. Get Top-4 Products

```typescript
const settings = await prisma.settings.findUnique({
  where: { id: 'singleton' },
})

const topPcs = await prisma.pcBuild.findMany({
  where: {
    id: { in: settings.topPcIds.slice(0, 4) },
  },
  include: {
    coverImage: true,
    fpsMetrics: {
      where: { resolution: 'FHD' },
      take: 3,
    },
  },
})
```

### 5. Create Customer Lead

```typescript
const lead = await prisma.lead.create({
  data: {
    tgUserId: '123456789',
    items: [
      {
        pcId: 'cm123abc',
        options: { ram: 32, ssd: 1024 },
        price: 350000,
      },
    ],
    phone: '+7 900 123-45-67',
    comment: 'Хочу собрать ПК для гейминга',
  },
})
```

---

## Budget Presets

Configured in Settings:

```json
[
  [46000, 100000],    // Entry-level
  [100000, 150000],   // Budget gaming
  [150000, 225000],   // Mid-range
  [225000, 300000],   // High-end
  [300000, 500000]    // Enthusiast
]
```

---

## Performance Optimization

### Indexed Fields
- **PcBuild**: slug, priceBase, isTop, availability
- **Device**: slug, price, isTop, categoryId
- **FpsMetric**: (pcId, resolution, game) - composite unique
- **ImageAsset**: (bucket, key)
- **PromoCampaign**: (active, priority)

### Query Tips
1. **Always use indexed fields** for WHERE clauses
2. **Limit gallery images** with `take` to avoid over-fetching
3. **Use select** to fetch only needed fields
4. **Paginate** large result sets

---

## JSON Field Schemas

### PcBuild.spec
```typescript
{
  cpu: string      // "AMD Ryzen 7 7800X3D"
  gpu: string      // "NVIDIA RTX 4080 Super 16GB"
  ram: string      // "32GB DDR5-6000"
  ssd: string      // "2TB NVMe Gen4"
  psu: string      // "850W 80+ Gold"
  case: string     // "Lian Li O11 Dynamic"
  cooling?: string // "AIO 360mm RGB"
}
```

### PcBuild.options
```typescript
{
  ram: Array<{
    label: string  // "32GB DDR5-6000"
    sizeGb: number // 32
    delta: number  // 0 (price difference from base)
  }>
  ssd: Array<{
    label: string  // "2TB NVMe Gen4"
    sizeGb: number // 2048
    delta: number  // 0
  }>
}
```

### Settings.telegraph
```typescript
{
  privacy: string        // "https://telegra.ph/privacy-policy"
  offer: string          // "https://telegra.ph/public-offer"
  pd_consent: string     // "https://telegra.ph/personal-data-consent"
  review_consent: string // "https://telegra.ph/review-consent"
  faq: string           // "https://telegra.ph/faq"
}
```

### PromoCampaign.rules
```typescript
{
  type: 'percentOff' | 'amountOff' | 'fixedPrice'
  value: number           // 15 (for 15% off) or 5000 (for 5000 RUB off)
  minPrice?: number      // Minimum price to apply promo
  maxPrice?: number      // Maximum price to apply promo
  tags?: string[]        // ["gaming-pc", "workstation"]
}
```

---

## Migration Workflow

### Development
```bash
# Make schema changes in schema.prisma
pnpm db:push  # Quick sync for dev
```

### Production
```bash
# Create migration
pnpm db:migrate

# Apply to production
DATABASE_URL="postgres://prod..." pnpm db:migrate deploy
```

---

## Troubleshooting

### "Prisma Client not found"
```bash
pnpm db:generate
```

### "Table already exists"
```bash
pnpm db:reset  # WARNING: Deletes all data
```

### "Type errors after schema change"
```bash
pnpm db:generate
# Restart your dev server
```

---

## Best Practices

1. **Always use transactions** for multi-table operations
2. **Validate JSON data** before storing
3. **Use enums** instead of magic strings
4. **Index frequently queried fields**
5. **Soft delete** when possible (add `deletedAt` field)
6. **Version your migrations** in production
7. **Backup database** before major changes

---

## Production Checklist

- [ ] Set `DATABASE_URL` in production environment
- [ ] Run `pnpm db:migrate deploy` to apply migrations
- [ ] Configure connection pooling (PgBouncer/Prisma Accelerate)
- [ ] Set up automated backups
- [ ] Monitor query performance
- [ ] Configure read replicas for heavy read workloads
- [ ] Implement caching layer (Redis) for hot data
