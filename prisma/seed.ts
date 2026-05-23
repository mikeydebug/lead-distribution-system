import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create Services
  const servicesData = [
    { name: 'Service 1' },
    { name: 'Service 2' },
    { name: 'Service 3' },
  ]

  for (const s of servicesData) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name },
    })
  }

  // Create Providers
  const providersData = Array.from({ length: 8 }).map((_, i) => ({
    name: `Provider ${i + 1}`,
    quota: 10,
    currentQuota: 10,
  }))

  // Ensure they are created with explicit IDs if possible, or just sequential.
  // It's safer to delete all providers and re-seed or upsert by ID.
  for (let i = 0; i < providersData.length; i++) {
    await prisma.provider.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        id: i + 1,
        ...providersData[i],
      },
    })
  }

  // Initialize Allocation States
  for (let i = 0; i < servicesData.length; i++) {
    await prisma.allocationState.upsert({
      where: { serviceId: i + 1 },
      update: {},
      create: {
        id: i + 1,
        serviceId: i + 1,
        lastProviderId: null,
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
