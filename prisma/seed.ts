import { PrismaClient } from './generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/portfolio?schema=public'
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const projects = [
  {
    slug: 'nimbus-analytics',
    title: 'Nimbus Analytics',
    category: 'web',
    featured: true,
    year: 2025,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    description: 'Real-time product analytics platform processing 40M+ events per day. Rebuilt the query layer and dashboard engine — cutting median report load time from 6.2s to 480ms.',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'ClickHouse', 'AWS'],
  },
  {
    slug: 'vaultpay-api',
    title: 'Vaultpay API',
    category: 'web',
    featured: false,
    year: 2025,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    description: 'Payment infrastructure handling 12k TPS with idempotent gRPC services and automated reconciliation.',
    tags: ['Go', 'gRPC', 'Redis', 'Kubernetes'],
  },
  {
    slug: 'kanvas-design-system',
    title: 'Kanvas Design System',
    category: 'web',
    featured: false,
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1000&q=80',
    description: '120+ accessible components and design tokens adopted across 6 product teams, with automated visual regression.',
    tags: ['React', 'Storybook', 'Tailwind', 'Playwright'],
  },
  {
    slug: 'terra-logistics',
    title: 'Terra Logistics',
    category: 'mobile',
    featured: false,
    year: 2024,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    description: 'Fleet tracking PWA with offline-first routing and live map telemetry for 1,800+ vehicles across Southeast Asia.',
    tags: ['React Native', 'Mapbox', 'Node.js', 'MQTT'],
  },
  {
    slug: 'opentrack-cli',
    title: 'opentrack CLI',
    category: 'oss',
    featured: false,
    year: 2023,
    imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1000&q=80',
    description: 'Open-source time-tracking CLI with 4.2k GitHub stars, plugin system, and native SQLite storage.',
    tags: ['Node.js', 'TypeScript', 'SQLite', 'OSS'],
  },
]

export const seedDatabase = async (): Promise<void> => {
  for (const item of projects) {
    const { tags, ...data } = item
    const project = await prisma.project.upsert({
      where: { slug: item.slug },
      update: { ...data },
      create: { ...data },
    })

    for (const tagName of tags) {
      await prisma.projectTag.upsert({
        where: {
          projectId_name: {
            projectId: project.id,
            name: tagName,
          },
        },
        update: {},
        create: {
          name: tagName,
          projectId: project.id,
        },
      })
    }
  }
}

seedDatabase()
  .then(() => {
    console.log('Database seeded successfully')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
