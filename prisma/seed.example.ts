import { PrismaClient, Target } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.device.deleteMany()
  await prisma.pc.deleteMany()

  // Seed Gaming PCs
  const pcs = await Promise.all([
    prisma.pc.create({
      data: {
        slug: 'gaming-pc-rtx-4070-fhd',
        title: 'Игровой ПК RTX 4070 - FHD',
        coverUrl: '/images/pcs/rtx-4070-cover.jpg',
        gallery: [
          '/images/pcs/rtx-4070-1.jpg',
          '/images/pcs/rtx-4070-2.jpg',
          '/images/pcs/rtx-4070-3.jpg',
        ],
        priceBase: 120000,
        targets: [Target.FHD, Target.QHD],
        spec: {
          cpu: 'AMD Ryzen 7 7700X',
          gpu: 'GeForce RTX 4070',
          ram: '32GB DDR5-6000',
          ssd: '1TB NVMe Gen4',
          psu: '750W 80+ Gold',
          cooling: 'AIO 240mm',
        },
        options: {
          ram: [
            { label: '16GB DDR5', delta: -5000 },
            { label: '32GB DDR5', delta: 0 },
            { label: '64GB DDR5', delta: 12000 },
          ],
          ssd: [
            { label: '512GB NVMe', delta: -3000 },
            { label: '1TB NVMe', delta: 0 },
            { label: '2TB NVMe', delta: 8000 },
          ],
        },
        isTop: true,
      },
    }),

    prisma.pc.create({
      data: {
        slug: 'gaming-pc-rtx-4080-qhd',
        title: 'Игровой ПК RTX 4080 - QHD',
        coverUrl: '/images/pcs/rtx-4080-cover.jpg',
        gallery: [
          '/images/pcs/rtx-4080-1.jpg',
          '/images/pcs/rtx-4080-2.jpg',
        ],
        priceBase: 220000,
        targets: [Target.QHD, Target.UHD4K],
        spec: {
          cpu: 'AMD Ryzen 9 7900X',
          gpu: 'GeForce RTX 4080',
          ram: '32GB DDR5-6400',
          ssd: '2TB NVMe Gen4',
          psu: '850W 80+ Platinum',
          cooling: 'AIO 360mm',
        },
        options: {
          ram: [
            { label: '32GB DDR5', delta: 0 },
            { label: '64GB DDR5', delta: 15000 },
            { label: '128GB DDR5', delta: 35000 },
          ],
          ssd: [
            { label: '1TB NVMe', delta: -8000 },
            { label: '2TB NVMe', delta: 0 },
            { label: '4TB NVMe', delta: 18000 },
          ],
        },
        isTop: true,
      },
    }),

    prisma.pc.create({
      data: {
        slug: 'gaming-pc-rtx-4060-budget',
        title: 'Бюджетный ПК RTX 4060',
        coverUrl: '/images/pcs/rtx-4060-cover.jpg',
        gallery: ['/images/pcs/rtx-4060-1.jpg'],
        priceBase: 85000,
        targets: [Target.FHD],
        spec: {
          cpu: 'AMD Ryzen 5 7600',
          gpu: 'GeForce RTX 4060',
          ram: '16GB DDR5-5600',
          ssd: '512GB NVMe',
          psu: '650W 80+ Bronze',
          cooling: 'Tower Air Cooler',
        },
        options: {
          ram: [
            { label: '16GB DDR5', delta: 0 },
            { label: '32GB DDR5', delta: 6000 },
          ],
          ssd: [
            { label: '512GB NVMe', delta: 0 },
            { label: '1TB NVMe', delta: 3000 },
          ],
        },
        isTop: false,
      },
    }),
  ])

  // Seed Devices (Peripherals)
  const devices = await Promise.all([
    prisma.device.create({
      data: {
        slug: 'hyperx-alloy-origins-core',
        category: 'keyboard',
        title: 'HyperX Alloy Origins Core',
        coverUrl: '/images/devices/hyperx-keyboard.jpg',
        price: 8500,
        isTop: true,
      },
    }),

    prisma.device.create({
      data: {
        slug: 'logitech-g502-hero',
        category: 'mouse',
        title: 'Logitech G502 HERO',
        coverUrl: '/images/devices/logitech-mouse.jpg',
        price: 6500,
        isTop: true,
      },
    }),

    prisma.device.create({
      data: {
        slug: 'asus-tuf-gaming-vg27aq',
        category: 'monitor',
        title: 'ASUS TUF Gaming VG27AQ 27" QHD 165Hz',
        coverUrl: '/images/devices/asus-monitor.jpg',
        price: 32000,
        isTop: false,
      },
    }),

    prisma.device.create({
      data: {
        slug: 'hyperx-cloud-ii',
        category: 'headset',
        title: 'HyperX Cloud II Gaming Headset',
        coverUrl: '/images/devices/hyperx-headset.jpg',
        price: 7500,
        isTop: false,
      },
    }),
  ])

  console.log(`✅ Created ${pcs.length} PCs`)
  console.log(`✅ Created ${devices.length} Devices`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
