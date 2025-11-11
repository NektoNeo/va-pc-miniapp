# Prisma Database Schema

Production-ready PostgreSQL schema for VA-PC Telegram Mini App.

## Database Models

### `Pc` - Gaming PC Configurations
- **id**: Unique CUID identifier
- **slug**: SEO-friendly URL slug (unique)
- **title**: PC configuration name
- **coverUrl**: Main product image
- **gallery**: Array of additional images
- **priceBase**: Base price (before customization)
- **targets**: Array of gaming targets (FHD, QHD, UHD4K)
- **spec**: JSON with CPU, GPU, RAM, SSD specs
- **options**: JSON with customization options (RAM/SSD upgrades)
- **isTop**: Featured on homepage
- **timestamps**: Auto-managed createdAt, updatedAt

### `Device` - Peripherals (keyboards, mice, monitors)
- **id**: Unique CUID identifier
- **slug**: SEO-friendly URL slug (unique)
- **category**: Device category (keyboard, mouse, monitor, etc.)
- **title**: Product name
- **coverUrl**: Product image
- **price**: Price in rubles
- **isTop**: Featured on homepage
- **timestamps**: Auto-managed createdAt, updatedAt

### `Target` Enum
Gaming resolution targets:
- `FHD` - Full HD (1920x1080)
- `QHD` - Quad HD (2560x1440)
- `UHD4K` - Ultra HD 4K (3840x2160)

## Setup Instructions

### 1. Install Dependencies
```bash
cd apps/miniapp
pnpm install
```

### 2. Configure Database
Add to `.env.local`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vapc_dev
```

### 3. Generate Prisma Client
```bash
pnpm db:generate
```

### 4. Create Database & Run Migration
```bash
# First-time setup
pnpm db:migrate

# Or push schema without migration (faster for dev)
pnpm db:push
```

### 5. Open Prisma Studio (Optional)
```bash
pnpm db:studio
```
Visit http://localhost:5555 to browse/edit data visually.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `db:generate` | `prisma generate` | Generate Prisma Client |
| `db:push` | `prisma db push` | Push schema to DB (no migration) |
| `db:migrate` | `prisma migrate dev` | Create & apply migration |
| `db:studio` | `prisma studio` | Open visual database editor |

## Example Data Structures

### Pc.spec (JSON)
```json
{
  "cpu": "AMD Ryzen 7 7800X3D",
  "gpu": "GeForce RTX 4070",
  "ram": "32GB DDR5",
  "ssd": "1TB NVMe",
  "psu": "750W 80+ Gold"
}
```

### Pc.options (JSON)
```json
{
  "ram": [
    { "label": "16GB DDR5", "delta": 0 },
    { "label": "32GB DDR5", "delta": 5000 },
    { "label": "64GB DDR5", "delta": 12000 }
  ],
  "ssd": [
    { "label": "512GB NVMe", "delta": 0 },
    { "label": "1TB NVMe", "delta": 3000 },
    { "label": "2TB NVMe", "delta": 8000 }
  ]
}
```

## Production Deployment

### Recommended Hosting
- **Railway** - Auto-deploy PostgreSQL
- **Supabase** - Managed PostgreSQL with free tier
- **Neon** - Serverless PostgreSQL
- **Vercel Postgres** - Native integration

### Migration Workflow
```bash
# 1. Create migration locally
pnpm db:migrate

# 2. Push to Git
git add prisma/migrations
git commit -m "Add database migration"

# 3. Deploy
# Migrations run automatically on Railway/Vercel
# Or run manually:
npx prisma migrate deploy
```

## Troubleshooting

### Reset Database
```bash
# WARNING: Deletes all data!
npx prisma migrate reset
```

### Connection Issues
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL format
- Test connection: `psql $DATABASE_URL`

### Schema Conflicts
```bash
# Pull current database state
npx prisma db pull

# Force schema to match Prisma
pnpm db:push --accept-data-loss
```
