import { PrismaClient, Resolution, Availability } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestBuilds() {
  console.log('🎮 Добавляем 4 тестовые сборки...\n')

  // Проверяем что есть mock изображения
  const mockImages = await prisma.imageAsset.findMany({
    where: {
      id: {
        in: ['mock-img-1', 'mock-img-2', 'mock-img-3']
      }
    }
  })

  if (mockImages.length === 0) {
    console.log('⚠️  Mock изображения не найдены. Запусти сначала: pnpm db:seed')
    process.exit(1)
  }

  console.log(`✅ Найдено ${mockImages.length} mock изображений\n`)

  // Сборка 1: Бюджетная для 1080p
  const build1 = await prisma.pcBuild.create({
    data: {
      slug: 'gaming-budget-1080p',
      title: 'Gaming PC - Бюджетный',
      subtitle: 'Идеальный выбор для 1080p гейминга',
      coverImageId: 'mock-img-1',
      priceBase: 75000,
      targets: [Resolution.FHD],
      spec: {
        cpu: 'AMD Ryzen 5 5600',
        gpu: 'NVIDIA GeForce RTX 4060',
        ram: '16GB DDR4 3200MHz',
        ssd: '512GB NVMe SSD',
        motherboard: 'ASUS B550-PLUS',
        psu: '550W 80+ Bronze',
        cooling: 'Башенный кулер',
        case: 'ATX Mid Tower'
      },
      options: {
        ram: [
          { label: '16GB DDR4', sizeGb: 16, delta: 0 },
          { label: '32GB DDR4', sizeGb: 32, delta: 4000 }
        ],
        ssd: [
          { label: '512GB NVMe', sizeGb: 512, delta: 0 },
          { label: '1TB NVMe', sizeGb: 1024, delta: 3000 }
        ]
      },
      availability: Availability.IN_STOCK,
      isTop: false,
      badges: ['Новинка', 'Хит продаж']
    }
  })
  console.log(`✅ Создана сборка #1: ${build1.title} (${build1.priceBase}₽)`)

  // Сборка 2: Средний уровень для 1440p
  const build2 = await prisma.pcBuild.create({
    data: {
      slug: 'gaming-mid-1440p',
      title: 'Gaming PC - Средний',
      subtitle: 'Оптимальный баланс для 1440p',
      coverImageId: 'mock-img-2',
      priceBase: 125000,
      targets: [Resolution.FHD, Resolution.QHD],
      spec: {
        cpu: 'AMD Ryzen 7 5800X',
        gpu: 'NVIDIA GeForce RTX 4070',
        ram: '32GB DDR4 3600MHz',
        ssd: '1TB NVMe SSD',
        motherboard: 'MSI B550 Gaming',
        psu: '650W 80+ Gold',
        cooling: 'Башенный кулер RGB',
        case: 'NZXT H510 Elite'
      },
      options: {
        ram: [
          { label: '32GB DDR4', sizeGb: 32, delta: 0 },
          { label: '64GB DDR4', sizeGb: 64, delta: 8000 }
        ],
        ssd: [
          { label: '1TB NVMe', sizeGb: 1024, delta: 0 },
          { label: '2TB NVMe', sizeGb: 2048, delta: 5000 }
        ]
      },
      availability: Availability.IN_STOCK,
      isTop: true,
      badges: ['Рекомендуем']
    }
  })
  console.log(`✅ Создана сборка #2: ${build2.title} (${build2.priceBase}₽)`)

  // Сборка 3: Мощная для 4K
  const build3 = await prisma.pcBuild.create({
    data: {
      slug: 'gaming-high-4k',
      title: 'Gaming PC - Мощный',
      subtitle: 'Максимальная производительность для 4K',
      coverImageId: 'mock-img-3',
      priceBase: 185000,
      targets: [Resolution.FHD, Resolution.QHD, Resolution.UHD4K],
      spec: {
        cpu: 'AMD Ryzen 7 7800X3D',
        gpu: 'NVIDIA GeForce RTX 4070 Ti SUPER',
        ram: '32GB DDR5 6000MHz',
        ssd: '2TB NVMe Gen4 SSD',
        motherboard: 'ASUS X670E-PLUS',
        psu: '850W 80+ Gold',
        cooling: 'AIO 240mm RGB',
        case: 'Lian Li O11 Dynamic'
      },
      options: {
        ram: [
          { label: '32GB DDR5', sizeGb: 32, delta: 0 },
          { label: '64GB DDR5', sizeGb: 64, delta: 12000 }
        ],
        ssd: [
          { label: '2TB NVMe Gen4', sizeGb: 2048, delta: 0 },
          { label: '4TB NVMe Gen4', sizeGb: 4096, delta: 10000 }
        ]
      },
      availability: Availability.IN_STOCK,
      isTop: true,
      badges: ['Топ', 'Премиум']
    }
  })
  console.log(`✅ Создана сборка #3: ${build3.title} (${build3.priceBase}₽)`)

  // Сборка 4: Флагман для энтузиастов
  const build4 = await prisma.pcBuild.create({
    data: {
      slug: 'gaming-ultra-enthusiast',
      title: 'Gaming PC - Флагман',
      subtitle: 'Безкомпромиссная мощь для профессионалов',
      coverImageId: 'mock-img-1',
      priceBase: 275000,
      targets: [Resolution.FHD, Resolution.QHD, Resolution.UHD4K],
      spec: {
        cpu: 'AMD Ryzen 9 7950X3D',
        gpu: 'NVIDIA GeForce RTX 4080 SUPER',
        ram: '64GB DDR5 6400MHz',
        ssd: '4TB NVMe Gen4 SSD',
        motherboard: 'ASUS ROG X670E Hero',
        psu: '1000W 80+ Platinum',
        cooling: 'AIO 360mm RGB',
        case: 'Lian Li O11 Dynamic XL'
      },
      options: {
        ram: [
          { label: '64GB DDR5', sizeGb: 64, delta: 0 },
          { label: '128GB DDR5', sizeGb: 128, delta: 25000 }
        ],
        ssd: [
          { label: '4TB NVMe Gen4', sizeGb: 4096, delta: 0 },
          { label: '8TB NVMe Gen4', sizeGb: 8192, delta: 20000 }
        ]
      },
      availability: Availability.PREORDER,
      isTop: true,
      badges: ['Эксклюзив', 'Предзаказ']
    }
  })
  console.log(`✅ Создана сборка #4: ${build4.title} (${build4.priceBase}₽)`)

  // Добавим FPS метрики для реалистичности
  console.log('\n📊 Добавляем FPS метрики...')

  // FPS для бюджетной сборки
  await prisma.fpsMetric.createMany({
    data: [
      { pcId: build1.id, game: 'Cyberpunk 2077', resolution: Resolution.FHD, fpsAvg: 60, fpsMin: 45, fpsP95: 72 },
      { pcId: build1.id, game: 'CS2', resolution: Resolution.FHD, fpsAvg: 180, fpsMin: 140, fpsP95: 210 },
      { pcId: build1.id, game: 'Fortnite', resolution: Resolution.FHD, fpsAvg: 144, fpsMin: 110, fpsP95: 165 }
    ]
  })

  // FPS для средней сборки
  await prisma.fpsMetric.createMany({
    data: [
      { pcId: build2.id, game: 'Cyberpunk 2077', resolution: Resolution.QHD, fpsAvg: 75, fpsMin: 60, fpsP95: 85 },
      { pcId: build2.id, game: 'CS2', resolution: Resolution.QHD, fpsAvg: 220, fpsMin: 180, fpsP95: 260 },
      { pcId: build2.id, game: 'Fortnite', resolution: Resolution.QHD, fpsAvg: 165, fpsMin: 130, fpsP95: 190 }
    ]
  })

  // FPS для мощной сборки
  await prisma.fpsMetric.createMany({
    data: [
      { pcId: build3.id, game: 'Cyberpunk 2077', resolution: Resolution.UHD4K, fpsAvg: 60, fpsMin: 50, fpsP95: 70 },
      { pcId: build3.id, game: 'CS2', resolution: Resolution.UHD4K, fpsAvg: 180, fpsMin: 150, fpsP95: 210 },
      { pcId: build3.id, game: 'Fortnite', resolution: Resolution.UHD4K, fpsAvg: 120, fpsMin: 95, fpsP95: 140 }
    ]
  })

  // FPS для флагмана
  await prisma.fpsMetric.createMany({
    data: [
      { pcId: build4.id, game: 'Cyberpunk 2077', resolution: Resolution.UHD4K, fpsAvg: 85, fpsMin: 70, fpsP95: 95 },
      { pcId: build4.id, game: 'CS2', resolution: Resolution.UHD4K, fpsAvg: 240, fpsMin: 200, fpsP95: 280 },
      { pcId: build4.id, game: 'Fortnite', resolution: Resolution.UHD4K, fpsAvg: 165, fpsMin: 140, fpsP95: 185 }
    ]
  })

  console.log('✅ FPS метрики добавлены для всех сборок')

  console.log('\n✨ Готово! Добавлено 4 тестовые сборки:\n')
  console.log(`1. ${build1.title} - ${build1.priceBase.toLocaleString()}₽ (1080p)`)
  console.log(`2. ${build2.title} - ${build2.priceBase.toLocaleString()}₽ (1440p) [ТОП]`)
  console.log(`3. ${build3.title} - ${build3.priceBase.toLocaleString()}₽ (4K) [ТОП]`)
  console.log(`4. ${build4.title} - ${build4.priceBase.toLocaleString()}₽ (4K Энтузиаст) [ТОП]`)
  console.log('\n🌐 Открой приложение: http://localhost:3002')
  console.log('🔧 Или админку: http://localhost:3002/admin/pcs')
}

addTestBuilds()
  .catch((error) => {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
