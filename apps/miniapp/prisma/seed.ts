import { PrismaClient, Resolution, Availability, ImageFormat, CategoryKind, EntityType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...')
  await prisma.lead.deleteMany()
  await prisma.fpsMetric.deleteMany()
  await prisma.priceHistory.deleteMany()
  await prisma.promoCampaign.deleteMany()
  await prisma.device.deleteMany()
  await prisma.pcBuild.deleteMany()
  await prisma.category.deleteMany()
  await prisma.videoAsset.deleteMany()
  await prisma.imageAsset.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.adminUser.deleteMany()

  // ============================================================================
  // ADMIN USERS (for admin panel access)
  // ============================================================================
  console.log('👤 Creating admin users...')

  const bcrypt = await import('bcryptjs')
  const testAdminPassword = await bcrypt.hash('TestPassword123!', 10)

  await prisma.adminUser.create({
    data: {
      email: 'test@va-pc.ru',
      passwordHash: testAdminPassword,
      name: 'Test Admin',
      role: 'SUPER_ADMIN',
      active: true,
    },
  })

  console.log('✅ Created test admin user: test@va-pc.ru / TestPassword123!')

  // ============================================================================
  // IMAGE ASSETS
  // ============================================================================
  console.log('📸 Creating image assets...')

  // Create E2E Test Mock Images with fixed IDs
  console.log('🧪 Creating mock images for E2E tests...')
  await prisma.imageAsset.create({
    data: {
      id: 'mock-img-1',
      bucket: 'va-pc-media',
      key: 'test/mock-placeholder-1.webp',
      mime: 'image/webp',
      width: 1200,
      height: 800,
      bytes: 100000,
      format: ImageFormat.WEBP,
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      avgColor: '#808080',
      alt: 'Mock Placeholder 1 for E2E tests',
    },
  })

  await prisma.imageAsset.create({
    data: {
      id: 'mock-img-2',
      bucket: 'va-pc-media',
      key: 'test/mock-placeholder-2.webp',
      mime: 'image/webp',
      width: 1200,
      height: 800,
      bytes: 100000,
      format: ImageFormat.WEBP,
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      avgColor: '#808080',
      alt: 'Mock Placeholder 2 for E2E tests',
    },
  })

  await prisma.imageAsset.create({
    data: {
      id: 'mock-img-3',
      bucket: 'va-pc-media',
      key: 'test/mock-placeholder-3.webp',
      mime: 'image/webp',
      width: 1200,
      height: 800,
      bytes: 100000,
      format: ImageFormat.WEBP,
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      avgColor: '#808080',
      alt: 'Mock Placeholder 3 for E2E tests',
    },
  })

  console.log('✅ Created 3 mock images: mock-img-1, mock-img-2, mock-img-3')

  const images = await Promise.all([
    // PC Build Cover Images
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'pcs/gaming-beast-pro-cover.webp',
        mime: 'image/webp',
        width: 1200,
        height: 800,
        bytes: 245000,
        format: ImageFormat.WEBP,
        blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH',
        avgColor: '#2a2a3e',
        alt: 'Gaming Beast Pro - High-end gaming PC',
      },
    }),
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'pcs/budget-gamer-cover.webp',
        mime: 'image/webp',
        width: 1200,
        height: 800,
        bytes: 220000,
        format: ImageFormat.WEBP,
        blurhash: 'LGF5ā=~qfQ?b^*RjWBj[0JD%%M',
        avgColor: '#3a3a5e',
        alt: 'Budget Gamer - Affordable gaming PC',
      },
    }),
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'pcs/workstation-ultra-cover.webp',
        mime: 'image/webp',
        width: 1200,
        height: 800,
        bytes: 260000,
        format: ImageFormat.WEBP,
        blurhash: 'L8Ryp+4n00~q9F-;00of00xu-;xu',
        avgColor: '#1a1a2e',
        alt: 'Workstation Ultra - Professional workstation',
      },
    }),
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'pcs/creator-studio-cover.webp',
        mime: 'image/webp',
        width: 1200,
        height: 800,
        bytes: 255000,
        format: ImageFormat.WEBP,
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
        avgColor: '#2e2a4e',
        alt: 'Creator Studio - Content creation PC',
      },
    }),
    // Device Cover Images
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'devices/gaming-keyboard-cover.webp',
        mime: 'image/webp',
        width: 800,
        height: 600,
        bytes: 180000,
        format: ImageFormat.WEBP,
        blurhash: 'L02E}iD%00~q00xu00Rj00j[00Rj',
        avgColor: '#1e1e2e',
        alt: 'RGB Gaming Keyboard',
      },
    }),
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'devices/gaming-mouse-cover.webp',
        mime: 'image/webp',
        width: 800,
        height: 600,
        bytes: 160000,
        format: ImageFormat.WEBP,
        blurhash: 'L34V+w4n00~q00-;00Rj00of00xu',
        avgColor: '#2a2a3e',
        alt: 'Precision Gaming Mouse',
      },
    }),
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'devices/gaming-headset-cover.webp',
        mime: 'image/webp',
        width: 800,
        height: 600,
        bytes: 190000,
        format: ImageFormat.WEBP,
        blurhash: 'L45f-=00~qD%00D%00D%00ay00ay',
        avgColor: '#3a3a5e',
        alt: '7.1 Surround Gaming Headset',
      },
    }),
    prisma.imageAsset.create({
      data: {
        bucket: 'va-pc-media',
        key: 'devices/gaming-monitor-cover.webp',
        mime: 'image/webp',
        width: 800,
        height: 600,
        bytes: 210000,
        format: ImageFormat.WEBP,
        blurhash: 'L23c$t00~qM{00M{00t700xu00WB',
        avgColor: '#1a1a2e',
        alt: '27" 165Hz Gaming Monitor',
      },
    }),
    // Gallery Images (simplified for demo)
    ...Array.from({ length: 12 }, (_, i) =>
      prisma.imageAsset.create({
        data: {
          bucket: 'va-pc-media',
          key: `gallery/img-${i + 1}.webp`,
          mime: 'image/webp',
          width: 1000,
          height: 750,
          bytes: 200000 + Math.floor(Math.random() * 50000),
          format: ImageFormat.WEBP,
          blurhash: 'L45f-=00~qD%00D%00D%00ay00ay',
          avgColor: '#2a2a3e',
          alt: `Gallery image ${i + 1}`,
        },
      })
    ),
  ])

  console.log(`✅ Created ${images.length} images`)

  const [
    pcCover1,
    pcCover2,
    pcCover3,
    pcCover4,
    deviceCover1,
    deviceCover2,
    deviceCover3,
    deviceCover4,
    ...galleryImages
  ] = images

  // ============================================================================
  // VIDEO ASSETS (Optional for PCs)
  // ============================================================================
  console.log('🎥 Creating video assets...')

  const video1 = await prisma.videoAsset.create({
    data: {
      bucket: 'va-pc-media',
      key: 'videos/gaming-beast-demo.mp4',
      mime: 'video/mp4',
      width: 1920,
      height: 1080,
      durationSec: 45,
      bytes: 15000000,
    },
  })

  console.log('✅ Created 1 video')

  // ============================================================================
  // CATEGORIES
  // ============================================================================
  console.log('📁 Creating categories...')

  const peripheralsCategory = await prisma.category.create({
    data: {
      kind: CategoryKind.DEVICE,
      title: 'Периферия',
    },
  })

  const monitorsCategory = await prisma.category.create({
    data: {
      kind: CategoryKind.DEVICE,
      title: 'Мониторы',
    },
  })

  console.log('✅ Created 2 categories')

  // ============================================================================
  // PC BUILDS
  // ============================================================================
  console.log('💻 Creating PC builds...')

  const pcBuilds = await Promise.all([
    // 1. Gaming Beast Pro (High-end)
    prisma.pcBuild.create({
      data: {
        slug: 'gaming-beast-pro',
        title: 'Gaming Beast Pro',
        subtitle: 'Максимальная производительность для 4K гейминга',
        coverImageId: pcCover1.id,
        gallery: {
          connect: galleryImages.slice(0, 3).map((img) => ({ id: img.id })),
        },
        videoId: video1.id,
        priceBase: 350000,
        targets: [Resolution.FHD, Resolution.QHD, Resolution.UHD4K],
        spec: {
          cpu: 'AMD Ryzen 7 7800X3D',
          gpu: 'NVIDIA RTX 4080 Super 16GB',
          ram: '32GB DDR5-6000',
          ssd: '2TB NVMe Gen4',
          psu: '850W 80+ Gold',
          case: 'Lian Li O11 Dynamic',
          cooling: 'AIO 360mm RGB',
        },
        options: {
          ram: [
            { label: '32GB DDR5-6000', sizeGb: 32, delta: 0 },
            { label: '64GB DDR5-6000', sizeGb: 64, delta: 15000 },
          ],
          ssd: [
            { label: '2TB NVMe Gen4', sizeGb: 2048, delta: 0 },
            { label: '4TB NVMe Gen4', sizeGb: 4096, delta: 12000 },
          ],
        },
        isTop: true,
        badges: ['New', 'Popular', '4K Ready'],
        availability: Availability.IN_STOCK,
      },
    }),

    // 2. Budget Gamer (Entry-level)
    prisma.pcBuild.create({
      data: {
        slug: 'budget-gamer',
        title: 'Budget Gamer',
        subtitle: 'Доступный вход в мир компьютерных игр',
        coverImageId: pcCover2.id,
        gallery: {
          connect: galleryImages.slice(3, 6).map((img) => ({ id: img.id })),
        },
        priceBase: 85000,
        targets: [Resolution.FHD],
        spec: {
          cpu: 'AMD Ryzen 5 5600',
          gpu: 'NVIDIA RTX 4060 8GB',
          ram: '16GB DDR4-3200',
          ssd: '512GB NVMe',
          psu: '600W 80+ Bronze',
          case: 'DeepCool Matrexx 40',
          cooling: 'Stock Cooler',
        },
        options: {
          ram: [
            { label: '16GB DDR4-3200', sizeGb: 16, delta: 0 },
            { label: '32GB DDR4-3200', sizeGb: 32, delta: 5000 },
          ],
          ssd: [
            { label: '512GB NVMe', sizeGb: 512, delta: 0 },
            { label: '1TB NVMe', sizeGb: 1024, delta: 3500 },
          ],
        },
        isTop: true,
        badges: ['Best Value', 'Sale'],
        availability: Availability.IN_STOCK,
      },
    }),

    // 3. Workstation Ultra (Professional)
    prisma.pcBuild.create({
      data: {
        slug: 'workstation-ultra',
        title: 'Workstation Ultra',
        subtitle: 'Профессиональная рабочая станция для тяжелых задач',
        coverImageId: pcCover3.id,
        gallery: {
          connect: galleryImages.slice(6, 9).map((img) => ({ id: img.id })),
        },
        priceBase: 280000,
        targets: [Resolution.QHD, Resolution.UHD4K],
        spec: {
          cpu: 'AMD Ryzen 9 7950X',
          gpu: 'NVIDIA RTX 4070 Ti 12GB',
          ram: '64GB DDR5-5600',
          ssd: '2TB NVMe Gen4',
          psu: '1000W 80+ Platinum',
          case: 'Fractal Design Meshify 2',
          cooling: 'Custom Loop Water Cooling',
        },
        options: {
          ram: [
            { label: '64GB DDR5-5600', sizeGb: 64, delta: 0 },
            { label: '128GB DDR5-5600', sizeGb: 128, delta: 35000 },
          ],
          ssd: [
            { label: '2TB NVMe Gen4', sizeGb: 2048, delta: 0 },
            { label: '4TB NVMe Gen4', sizeGb: 4096, delta: 12000 },
            { label: '8TB NVMe Gen4', sizeGb: 8192, delta: 28000 },
          ],
        },
        isTop: true,
        badges: ['Professional', 'High Performance'],
        availability: Availability.IN_STOCK,
      },
    }),

    // 4. Creator Studio (Content Creation)
    prisma.pcBuild.create({
      data: {
        slug: 'creator-studio',
        title: 'Creator Studio',
        subtitle: 'Идеальный выбор для видеомонтажа и 3D-моделирования',
        coverImageId: pcCover4.id,
        gallery: {
          connect: galleryImages.slice(9, 12).map((img) => ({ id: img.id })),
        },
        priceBase: 195000,
        targets: [Resolution.QHD],
        spec: {
          cpu: 'Intel Core i7-14700K',
          gpu: 'NVIDIA RTX 4070 Super 12GB',
          ram: '32GB DDR5-5600',
          ssd: '1TB NVMe Gen4',
          psu: '750W 80+ Gold',
          case: 'NZXT H7 Flow',
          cooling: 'AIO 280mm',
        },
        options: {
          ram: [
            { label: '32GB DDR5-5600', sizeGb: 32, delta: 0 },
            { label: '64GB DDR5-5600', sizeGb: 64, delta: 16000 },
          ],
          ssd: [
            { label: '1TB NVMe Gen4', sizeGb: 1024, delta: 0 },
            { label: '2TB NVMe Gen4', sizeGb: 2048, delta: 6500 },
          ],
        },
        isTop: true,
        badges: ['Creator', 'Recommended'],
        availability: Availability.PREORDER,
      },
    }),
  ])

  console.log(`✅ Created ${pcBuilds.length} PC builds`)

  // ============================================================================
  // FPS METRICS
  // ============================================================================
  console.log('🎮 Creating FPS metrics...')

  const games = ['Cyberpunk 2077', 'CS2', 'Hogwarts Legacy', 'Starfield']
  let fpsMetricsCount = 0

  for (const pc of pcBuilds) {
    for (const game of games) {
      for (const resolution of pc.targets as Resolution[]) {
        let fpsAvg = 60
        let fpsMin = 45
        let fpsP95 = 70

        // Calculate realistic FPS based on price tier and resolution
        if (pc.priceBase > 300000) {
          // High-end
          fpsAvg = resolution === Resolution.UHD4K ? 85 : resolution === Resolution.QHD ? 120 : 165
          fpsMin = Math.floor(fpsAvg * 0.7)
          fpsP95 = Math.floor(fpsAvg * 1.1)
        } else if (pc.priceBase > 150000) {
          // Mid-range
          fpsAvg = resolution === Resolution.UHD4K ? 55 : resolution === Resolution.QHD ? 90 : 144
          fpsMin = Math.floor(fpsAvg * 0.65)
          fpsP95 = Math.floor(fpsAvg * 1.05)
        } else {
          // Budget
          fpsAvg = resolution === Resolution.FHD ? 75 : 50
          fpsMin = Math.floor(fpsAvg * 0.6)
          fpsP95 = Math.floor(fpsAvg * 1.0)
        }

        await prisma.fpsMetric.create({
          data: {
            pcId: pc.id,
            game,
            resolution,
            fpsMin,
            fpsAvg,
            fpsP95,
          },
        })
        fpsMetricsCount++
      }
    }
  }

  console.log(`✅ Created ${fpsMetricsCount} FPS metrics`)

  // ============================================================================
  // DEVICES
  // ============================================================================
  console.log('⌨️ Creating devices...')

  const devices = await Promise.all([
    prisma.device.create({
      data: {
        slug: 'rgb-gaming-keyboard',
        categoryId: peripheralsCategory.id,
        title: 'RGB Gaming Keyboard Pro',
        price: 8500,
        coverImageId: deviceCover1.id,
        gallery: {
          connect: [{ id: deviceCover1.id }],
        },
        badges: ['RGB', 'Mechanical'],
        isTop: true,
      },
    }),
    prisma.device.create({
      data: {
        slug: 'precision-gaming-mouse',
        categoryId: peripheralsCategory.id,
        title: 'Precision Gaming Mouse X1',
        price: 5500,
        coverImageId: deviceCover2.id,
        gallery: {
          connect: [{ id: deviceCover2.id }],
        },
        badges: ['16000 DPI', 'Wireless'],
        isTop: true,
      },
    }),
    prisma.device.create({
      data: {
        slug: 'surround-gaming-headset',
        categoryId: peripheralsCategory.id,
        title: '7.1 Surround Gaming Headset',
        price: 7200,
        coverImageId: deviceCover3.id,
        gallery: {
          connect: [{ id: deviceCover3.id }],
        },
        badges: ['7.1 Surround', 'Noise Cancelling'],
        isTop: true,
      },
    }),
    prisma.device.create({
      data: {
        slug: 'gaming-monitor-165hz',
        categoryId: monitorsCategory.id,
        title: '27" 165Hz Gaming Monitor',
        price: 25000,
        coverImageId: deviceCover4.id,
        gallery: {
          connect: [{ id: deviceCover4.id }],
        },
        badges: ['165Hz', 'G-Sync', '1ms'],
        isTop: true,
      },
    }),
  ])

  console.log(`✅ Created ${devices.length} devices`)

  // ============================================================================
  // PROMO CAMPAIGN
  // ============================================================================
  console.log('🎉 Creating promo campaign...')

  const promoCampaign = await prisma.promoCampaign.create({
    data: {
      title: 'Новогодняя распродажа',
      slug: 'new-year-sale-2025',
      description: 'Скидки до 15% на все игровые ПК!',
      active: true,
      startsAt: new Date('2025-01-01'),
      endsAt: new Date('2025-01-31'),
      rules: {
        type: 'percentOff',
        value: 15,
        minPrice: 80000,
        maxPrice: 500000,
        tags: ['gaming-pc'],
      },
      priority: 10,
    },
  })

  console.log('✅ Created 1 promo campaign')

  // ============================================================================
  // SETTINGS (Singleton)
  // ============================================================================
  console.log('⚙️ Creating settings...')

  const settings = await prisma.settings.create({
    data: {
      id: 'singleton',
      topPcIds: pcBuilds.map((pc) => pc.id),
      topDeviceIds: devices.map((device) => device.id),
      budgetPresets: [
        [46000, 100000],
        [100000, 150000],
        [150000, 225000],
        [225000, 300000],
        [300000, 500000],
      ],
      telegraph: {
        privacy: 'https://telegra.ph/privacy-policy',
        offer: 'https://telegra.ph/public-offer',
        pd_consent: 'https://telegra.ph/personal-data-consent',
        review_consent: 'https://telegra.ph/review-consent',
        faq: 'https://telegra.ph/faq',
      },
    },
  })

  console.log('✅ Created settings')

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n🎉 Seed completed successfully!')
  console.log('━'.repeat(50))
  console.log(`📊 Created:`)
  console.log(`   • ${images.length} images`)
  console.log(`   • 1 video`)
  console.log(`   • 2 categories`)
  console.log(`   • ${pcBuilds.length} PC builds`)
  console.log(`   • ${fpsMetricsCount} FPS metrics`)
  console.log(`   • ${devices.length} devices`)
  console.log(`   • 1 promo campaign`)
  console.log(`   • 1 settings record`)
  console.log('━'.repeat(50))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
