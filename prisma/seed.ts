import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * Seed database dengan data konten portfolio.
 *
 * Semua data di bawah diambil dari desain asli (docs/code.html).
 * Seed ini idempotent: menjalankannya berulang tidak membuat data
 * ganda karena semua record di-upsert berdasarkan unique key.
 */

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:password@localhost:5432/portfolio?schema=public";

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Profile (singleton)
// ---------------------------------------------------------------------------
const PROFILE = {
  id: "singleton",
  fullName: "Raka Devano",
  brand: "raka.dev",
  role: "Product Engineer",
  availabilityText: "Available for freelance — Jakarta, ID",
  heroLead:
    "Full-stack developer with **6+ years** crafting scalable web platforms, design systems, and cloud architecture — from the first wireframe to the last deploy.",
  rotatingWords: ["ship fast.", "scale well.", "feel premium.", "solve real problems."],
  photoUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
  photoTagline: "EST. 2019",
  aboutNote:
    "I care as much about pixel spacing and motion curves as I do about database indexes and CI pipelines.",
  aboutParagraphs: [
    "I'm **Raka**, a full-stack developer based in Jakarta. I started out writing PHP for local businesses, and today I architect **cloud-native platforms** used by thousands of people every day.",
    "My sweet spot is the intersection of **engineering and interface** — translating messy product requirements into clean APIs, resilient systems, and interfaces that feel obvious to use. I work best in small teams where design, code, and product sit at the same table.",
    "Outside of work you'll find me contributing to open source tooling, writing about performance budgets, or over-engineering my home lab.",
  ],
  badgeValue: "99%",
  badgeLabel: "On-time delivery across 48 shipped projects",
  contactSubtitle:
    "Got a product idea, a legacy system that needs rescuing, or a team that needs an extra pair of hands? My inbox is open.",
  contactEmail: "hello@rakadevano.dev",
  contactCallUrl: null,
};

// ---------------------------------------------------------------------------
// Fakta About — `value` memuat **penekanan** untuk frasa berwarna aksen
// ---------------------------------------------------------------------------
const ABOUT_FACTS = [
  { term: "Based in", value: "Jakarta, **Indonesia**" },
  { term: "Availability", value: "Open — **Q3 2026**" },
  { term: "Timezone", value: "**GMT+7** (WIB)" },
  { term: "Languages", value: "Indonesian, **English**" },
];

// ---------------------------------------------------------------------------
// Statistik hero
// ---------------------------------------------------------------------------
const STATS = [
  { value: 6, suffix: "+", label: "Years exp" },
  { value: 48, suffix: "+", label: "Projects" },
  { value: 26, suffix: "+", label: "Clients" },
  { value: 12, suffix: "", label: "Open source" },
];

// ---------------------------------------------------------------------------
// Layanan
// ---------------------------------------------------------------------------
const SERVICES = [
  {
    name: "Product Engineering",
    description:
      "Web apps, dashboards & SaaS platforms built with Next.js, TypeScript and Node — from architecture to production.",
  },
  {
    name: "UI Engineering & Design Systems",
    description:
      "Component libraries, motion design and accessibility-first interfaces that stay consistent as teams scale.",
  },
  {
    name: "Cloud & DevOps",
    description:
      "AWS infrastructure, container orchestration, CI/CD pipelines and observability that let teams deploy with confidence.",
  },
  {
    name: "Technical Consulting",
    description:
      "Code audits, performance budgets, architecture reviews and mentoring for growing engineering teams.",
  },
];

// ---------------------------------------------------------------------------
// Tech stack
// ---------------------------------------------------------------------------
const STACK_GROUPS = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Vue", "Tailwind CSS", "Framer Motion", "GSAP", "WebGL"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Go", "NestJS", "GraphQL", "gRPC", "PostgreSQL", "Redis", "MongoDB"],
  },
  {
    title: "Cloud & DevOps",
    items: ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Vercel", "Grafana"],
  },
  {
    title: "Design & Tools",
    items: ["Figma", "Storybook", "Playwright", "Vitest", "Linear", "Git", "Figma MCP"],
  },
];

// ---------------------------------------------------------------------------
// Project (kategori disimpan sebagai enum Prisma: WEB / MOBILE / OSS)
// ---------------------------------------------------------------------------
const PROJECTS = [
  {
    slug: "nimbus-analytics",
    title: "Nimbus Analytics",
    description:
      "Real-time product analytics platform processing 40M+ events per day. Rebuilt the query layer and dashboard engine — cutting median report load time from 6.2s to 480ms.",
    category: "WEB" as const,
    year: 2025,
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    href: null,
    featured: true,
    tags: ["Next.js", "TypeScript", "PostgreSQL", "ClickHouse", "AWS"],
  },
  {
    slug: "vaultpay-api",
    title: "Vaultpay API",
    description:
      "Payment infrastructure handling 12k TPS with idempotent gRPC services and automated reconciliation.",
    category: "WEB" as const,
    year: 2025,
    imageUrl:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
    href: null,
    featured: false,
    tags: ["Go", "gRPC", "Redis", "Kubernetes"],
  },
  {
    slug: "kanvas-design-system",
    title: "Kanvas Design System",
    description:
      "120+ accessible components and design tokens adopted across 6 product teams, with automated visual regression.",
    category: "WEB" as const,
    year: 2024,
    imageUrl:
      "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1000&q=80",
    href: null,
    featured: false,
    tags: ["React", "Storybook", "Tailwind", "Playwright"],
  },
  {
    slug: "terra-logistics",
    title: "Terra Logistics",
    description:
      "Fleet tracking PWA with offline-first routing and live map telemetry for 1,800+ vehicles across Southeast Asia.",
    category: "MOBILE" as const,
    year: 2024,
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    href: null,
    featured: false,
    tags: ["React Native", "Mapbox", "Node.js", "MQTT"],
  },
  {
    slug: "opentrack-cli",
    title: "opentrack CLI",
    description:
      "Open-source time-tracking CLI with 4.2k GitHub stars, plugin system, and native SQLite storage.",
    category: "OSS" as const,
    year: 2023,
    imageUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1000&q=80",
    href: "https://github.com",
    featured: false,
    tags: ["Node.js", "TypeScript", "SQLite", "OSS"],
  },
];

// ---------------------------------------------------------------------------
// Pengalaman karier
// ---------------------------------------------------------------------------
const EXPERIENCES = [
  {
    role: "Senior Full-Stack Engineer",
    dateLabel: "2023 — Present",
    company: "Northlane Technologies — Jakarta (Remote)",
    description:
      "Leading the platform squad for a B2B SaaS analytics product serving 200+ enterprise accounts.",
    points: [
      "Redesigned the event ingestion pipeline, reducing infrastructure cost by 34%.",
      "Introduced design-system-driven development across 3 product teams.",
      "Mentoring 5 engineers through weekly architecture reviews.",
    ],
  },
  {
    role: "Full-Stack Developer",
    dateLabel: "2021 — 2023",
    company: "Satu Digital Studio — Bandung",
    description: "Delivered 20+ client products across fintech, logistics and e-commerce.",
    points: [
      "Built a reusable Next.js starter that cut project setup time by 2 weeks.",
      "Led migration from REST monolith to modular GraphQL services.",
    ],
  },
  {
    role: "Frontend Developer",
    dateLabel: "2019 — 2021",
    company: "KaryaNusa — Yogyakarta",
    description:
      "Focused on interface engineering, motion design and performance optimisation.",
    points: [
      'Improved Core Web Vitals from "needs work" to green across 8 marketing sites.',
    ],
  },
  {
    role: "B.Sc Computer Science",
    dateLabel: "2015 — 2019",
    company: "Universitas Gadjah Mada",
    description:
      "Thesis on distributed caching strategies for high-traffic web applications.",
    points: [],
  },
];

// ---------------------------------------------------------------------------
// Testimonial
// ---------------------------------------------------------------------------
const TESTIMONIALS = [
  {
    quote:
      "Raka doesn't just write code — he **understands the product**. He shipped our dashboard two weeks early and it still runs flawlessly.",
    authorName: "Maya Prasetyo",
    authorRole: "Head of Product — Nimbus",
    authorImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    active: true,
  },
];

// ---------------------------------------------------------------------------
// Kartu kontak — `value` memuat **penekanan** untuk frasa berwarna aksen
// ---------------------------------------------------------------------------
const CONTACT_CARDS = [
  { key: "Availability", value: "Open for **freelance** & long-term" },
  { key: "Based in", value: "Jakarta, Indonesia — GMT+7" },
  { key: "Response time", value: "Usually within **24 hours**" },
];

// ---------------------------------------------------------------------------
// Sosial media
// ---------------------------------------------------------------------------
const SOCIAL_LINKS = [
  { label: "GitHub", url: "https://github.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
  { label: "Dribbble", url: "https://dribbble.com" },
  { label: "X / Twitter", url: "https://x.com" },
  { label: "Instagram", url: "https://instagram.com" },
];

// ---------------------------------------------------------------------------
// Eksekusi seed
// ---------------------------------------------------------------------------
export const seedDatabase = async (): Promise<void> => {
  console.log("⏳ Seeding database...");

  // Profile — cukup satu baris, upsert berdasarkan id tetap.
  await prisma.profile.upsert({
    where: { id: PROFILE.id },
    update: PROFILE,
    create: PROFILE,
  });
  console.log("✔ Profile");

  // Stats — hapus lalu tulis ulang agar urutan selalu konsisten.
  await prisma.stat.deleteMany();
  await prisma.stat.createMany({
    data: STATS.map((stat, index) => ({ ...stat, order: index })),
  });
  console.log("✔ Stats");

  // Services
  for (const [index, service] of SERVICES.entries()) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { description: service.description, order: index },
      create: { ...service, order: index },
    });
  }
  console.log("✔ Services");

  // Stack groups + items
  for (const [index, group] of STACK_GROUPS.entries()) {
    const created = await prisma.stackGroup.upsert({
      where: { title: group.title },
      update: { order: index },
      create: { title: group.title, order: index },
    });

    // Sinkronkan item: hapus yang tidak ada di seed, tambah yang belum ada.
    const existing = await prisma.stackItem.findMany({ where: { groupId: created.id } });
    const keep = new Set(group.items);

    for (const item of existing) {
      if (!keep.has(item.name)) {
        await prisma.stackItem.delete({ where: { id: item.id } });
      }
    }

    for (const [itemIndex, itemName] of group.items.entries()) {
      await prisma.stackItem.upsert({
        where: { groupId_name: { groupId: created.id, name: itemName } },
        update: { order: itemIndex },
        create: { name: itemName, order: itemIndex, groupId: created.id },
      });
    }
  }
  console.log("✔ Stack groups");

  // Projects + tags
  for (const [index, project] of PROJECTS.entries()) {
    const { tags, ...data } = project;
    const created = await prisma.project.upsert({
      where: { slug: project.slug },
      update: { ...data, order: index },
      create: { ...data, order: index },
    });

    for (const tagName of tags) {
      await prisma.projectTag.upsert({
        where: { projectId_name: { projectId: created.id, name: tagName } },
        update: {},
        create: { name: tagName, projectId: created.id },
      });
    }
  }
  console.log("✔ Projects");

  // Experiences + points
  for (const [index, exp] of EXPERIENCES.entries()) {
    const { points, ...data } = exp;
    const created = await prisma.experience.upsert({
      where: { id: `exp-${index}` },
      update: { ...data, order: index },
      create: { id: `exp-${index}`, ...data, order: index },
    });

    // Poin dihapus lalu ditulis ulang agar urutannya selalu sesuai seed.
    await prisma.experiencePoint.deleteMany({ where: { experienceId: created.id } });
    if (points.length > 0) {
      await prisma.experiencePoint.createMany({
        data: points.map((text, pointIndex) => ({
          text,
          order: pointIndex,
          experienceId: created.id,
        })),
      });
    }
  }
  console.log("✔ Experiences");

  // Testimonials — hanya satu yang aktif.
  for (const [index, testimonial] of TESTIMONIALS.entries()) {
    await prisma.testimonial.upsert({
      where: { id: `testimonial-${index}` },
      update: testimonial,
      create: { id: `testimonial-${index}`, ...testimonial, order: index },
    });
  }
  console.log("✔ Testimonials");

  // About facts
  for (const [index, fact] of ABOUT_FACTS.entries()) {
    await prisma.aboutFact.upsert({
      where: { term: fact.term },
      update: { ...fact, order: index },
      create: { ...fact, order: index },
    });
  }
  console.log("✔ About facts");

  // Contact cards
  for (const [index, card] of CONTACT_CARDS.entries()) {
    await prisma.contactCard.upsert({
      where: { key: card.key },
      update: { ...card, order: index },
      create: { ...card, order: index },
    });
  }
  console.log("✔ Contact cards");

  // Social links
  for (const [index, social] of SOCIAL_LINKS.entries()) {
    await prisma.socialLink.upsert({
      where: { label: social.label },
      update: { ...social, order: index },
      create: { ...social, order: index },
    });
  }
  console.log("✔ Social links");

  console.log("✅ Seed selesai.");
};

seedDatabase()
  .catch((error) => {
    console.error("❌ Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
