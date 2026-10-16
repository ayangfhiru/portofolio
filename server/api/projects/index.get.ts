import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const category = typeof query.category === 'string' ? query.category : undefined

  try {
    const prisma = getPrismaClient()
    const projects = await prisma.project.findMany({
      where: category && category !== 'all' ? { category } : undefined,
      include: {
        tags: true,
      },
      orderBy: [
        { featured: 'desc' },
        { year: 'desc' },
      ],
    })

    return {
      success: true,
      data: projects,
    }
  } catch (error) {
    // If DB is not connected or table not migrated yet, return fallback mock
    return {
      success: false,
      error: 'Database query failed or not configured',
      data: [
        {
          id: '1',
          slug: 'nimbus-analytics',
          title: 'Nimbus Analytics',
          category: 'web',
          featured: true,
          year: 2025,
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          description: 'Real-time product analytics platform processing 40M+ events per day. Rebuilt the query layer and dashboard engine — cutting median report load time from 6.2s to 480ms.',
          tags: [{ name: 'Next.js' }, { name: 'TypeScript' }, { name: 'PostgreSQL' }, { name: 'ClickHouse' }, { name: 'AWS' }],
        },
        {
          id: '2',
          slug: 'vaultpay-api',
          title: 'Vaultpay API',
          category: 'web',
          featured: false,
          year: 2025,
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
          description: 'Payment infrastructure handling 12k TPS with idempotent gRPC services and automated reconciliation.',
          tags: [{ name: 'Go' }, { name: 'gRPC' }, { name: 'Redis' }, { name: 'Kubernetes' }],
        },
        {
          id: '3',
          slug: 'kanvas-design-system',
          title: 'Kanvas Design System',
          category: 'web',
          featured: false,
          year: 2024,
          imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1000&q=80',
          description: '120+ accessible components and design tokens adopted across 6 product teams, with automated visual regression.',
          tags: [{ name: 'React' }, { name: 'Storybook' }, { name: 'Tailwind' }, { name: 'Playwright' }],
        },
        {
          id: '4',
          slug: 'terra-logistics',
          title: 'Terra Logistics',
          category: 'mobile',
          featured: false,
          year: 2024,
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
          description: 'Fleet tracking PWA with offline-first routing and live map telemetry for 1,800+ vehicles across Southeast Asia.',
          tags: [{ name: 'React Native' }, { name: 'Mapbox' }, { name: 'Node.js' }, { name: 'MQTT' }],
        },
        {
          id: '5',
          slug: 'opentrack-cli',
          title: 'opentrack CLI',
          category: 'oss',
          featured: false,
          year: 2023,
          imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1000&q=80',
          description: 'Open-source time-tracking CLI with 4.2k GitHub stars, plugin system, and native SQLite storage.',
          tags: [{ name: 'Node.js' }, { name: 'TypeScript' }, { name: 'SQLite' }, { name: 'OSS' }],
        },
      ].filter(p => !category || category === 'all' || p.category === category),
    }
  }
})
