import type { ContactCard, SocialLink } from "~~/app/types/contact";
import type { Experience } from "~~/app/types/experience";
import type { AboutFact, Profile, Stat } from "~~/app/types/profile";
import type { ProjectItem } from "~~/app/types/project";
import type { Service } from "~~/app/types/service";
import type { StackGroup } from "~~/app/types/stack";
import type { Testimonial } from "~~/app/types/testimonial";

/**
 * Data cadangan (fallback) yang dipakai HANYA saat koneksi database
 * gagal, supaya halaman tetap bisa dirender untuk pratinjau lokal.
 *
 * Data ini dimatikan secara otomatis di production (lihat `db.ts`).
 * Sumber kebenaran yang sesungguhnya adalah seed di `prisma/seed.ts`.
 *
 * Gambar menunjuk ke file yang di-commit di `public/images/portfolio/`
 * (sama seperti seed) agar pratinjau tidak bergantung pada URL eksternal.
 */

export const FALLBACK_PROFILE: Profile = {
  fullName: "Syang Ghege",
  brand: "ghege.dev",
  role: "Product Engineer",
  availabilityText: "Available for freelance — Jakarta, ID",
  heroLead:
    "Full-stack developer with **6+ years** crafting scalable web platforms, design systems, and cloud architecture — from the first wireframe to the last deploy.",
  rotatingWords: [
    "ship fast.",
    "scale well.",
    "feel premium.",
    "solve real problems.",
  ],
  photoUrl: "/images/portfolio/profile.png",
  photoTagline: "EST. 2019",
  aboutNote:
    "I care as much about pixel spacing and motion curves as I do about database indexes and CI pipelines.",
  aboutParagraphs: [
    "I'm **Ghege**, a full-stack developer based in Jakarta. I started out writing PHP for local businesses, and today I architect **cloud-native platforms** used by thousands of people every day.",
    "My sweet spot is the intersection of **engineering and interface** — translating messy product requirements into clean APIs, resilient systems, and interfaces that feel obvious to use. I work best in small teams where design, code, and product sit at the same table.",
    "Outside of work you'll find me contributing to open source tooling, writing about performance budgets, or over-engineering my home lab.",
  ],
  badgeValue: "99%",
  badgeLabel: "On-time delivery across 48 shipped projects",
  contactSubtitle:
    "Got a product idea, a legacy system that needs rescuing, or a team that needs an extra pair of hands? My inbox is open.",
  contactEmail: "hello@ghege.dev",
  contactCallUrl: null,
};

export const FALLBACK_FACTS: AboutFact[] = [
  { term: "Based in", value: "Jakarta, **Indonesia**" },
  { term: "Availability", value: "Open — **Q3 2026**" },
  { term: "Timezone", value: "**GMT+7** (WIB)" },
  { term: "Languages", value: "Indonesian, **English**" },
];

export const FALLBACK_STATS: Stat[] = [
  { value: 2, suffix: "+", label: "Years exp" },
  { value: 48, suffix: "+", label: "Projects" },
  { value: 26, suffix: "+", label: "Clients" },
  { value: 12, suffix: "", label: "Open source" },
];

export const FALLBACK_SERVICES: Service[] = [
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

export const FALLBACK_STACK: StackGroup[] = [
  {
    title: "Frontend",
    items: [
      "TypeScript",
      "React",
      "Next.js",
      "Vue",
      "Tailwind CSS",
      "Framer Motion",
      "GSAP",
      "WebGL",
    ],
  },
  {
    title: "Backend",
    items: [
      "Node.js",
      "Go",
      "NestJS",
      "GraphQL",
      "gRPC",
      "PostgreSQL",
      "Redis",
      "MongoDB",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "AWS",
      "Docker",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
      "Vercel",
      "Grafana",
    ],
  },
  {
    title: "Design & Tools",
    items: [
      "Figma",
      "Storybook",
      "Playwright",
      "Vitest",
      "Linear",
      "Git",
      "Figma MCP",
    ],
  },
];

export const FALLBACK_PROJECTS: ProjectItem[] = [
  {
    id: "1",
    slug: "nimbus-analytics",
    title: "Nimbus Analytics",
    description:
      "Real-time product analytics platform processing 40M+ events per day. Rebuilt the query layer and dashboard engine — cutting median report load time from 6.2s to 480ms.",
    category: "web",
    year: 2025,
    imageUrl: "/images/portfolio/project-nimbus-analytics.png",
    href: null,
    featured: true,
    tags: [
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "PostgreSQL" },
      { name: "ClickHouse" },
      { name: "AWS" },
    ],
    createdAt: "2025-01-10T08:15:00.000Z",
    updatedAt: "2026-01-14T09:38:00.000Z",
  },
  {
    id: "2",
    slug: "vaultpay-api",
    title: "Vaultpay API",
    description:
      "Payment infrastructure handling 12k TPS with idempotent gRPC services and automated reconciliation.",
    category: "web",
    year: 2025,
    imageUrl: "/images/portfolio/project-vaultpay-api.png",
    href: null,
    featured: false,
    tags: [
      { name: "Go" },
      { name: "gRPC" },
      { name: "Redis" },
      { name: "Kubernetes" },
    ],
    createdAt: "2025-03-02T11:42:00.000Z",
    updatedAt: "2025-11-20T16:05:00.000Z",
  },
  {
    id: "3",
    slug: "kanvas-design-system",
    title: "Kanvas Design System",
    description:
      "120+ accessible components and design tokens adopted across 6 product teams, with automated visual regression.",
    category: "web",
    year: 2024,
    imageUrl: "/images/portfolio/project-kanvas-design-system.png",
    href: null,
    featured: false,
    tags: [
      { name: "React" },
      { name: "Storybook" },
      { name: "Tailwind" },
      { name: "Playwright" },
    ],
    createdAt: "2024-06-18T10:20:00.000Z",
    updatedAt: "2025-08-05T13:12:00.000Z",
  },
  {
    id: "4",
    slug: "terra-logistics",
    title: "Terra Logistics",
    description:
      "Fleet tracking PWA with offline-first routing and live map telemetry for 1,800+ vehicles across Southeast Asia.",
    category: "mobile",
    year: 2024,
    imageUrl: "/images/portfolio/project-terra-logistics.png",
    href: null,
    featured: false,
    tags: [
      { name: "React Native" },
      { name: "Mapbox" },
      { name: "Node.js" },
      { name: "MQTT" },
    ],
    createdAt: "2024-02-27T07:48:00.000Z",
    updatedAt: "2025-04-16T18:31:00.000Z",
  },
  {
    id: "5",
    slug: "opentrack-cli",
    title: "opentrack CLI",
    description:
      "Open-source time-tracking CLI with 4.2k GitHub stars, plugin system, and native SQLite storage.",
    category: "oss",
    year: 2023,
    imageUrl: "/images/portfolio/project-opentrack-cli.png",
    href: "https://github.com",
    featured: false,
    tags: [
      { name: "Node.js" },
      { name: "TypeScript" },
      { name: "SQLite" },
      { name: "OSS" },
    ],
    createdAt: "2024-09-05T14:10:00.000Z",
    updatedAt: "2025-12-29T11:27:00.000Z",
  },
];

export const FALLBACK_EXPERIENCES: Experience[] = [
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
    description:
      "Delivered 20+ client products across fintech, logistics and e-commerce.",
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

export const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Ghege doesn't just write code — he **understands the product**. He shipped our dashboard two weeks early and it still runs flawlessly.",
    authorName: "Maya Prasetyo",
    authorRole: "Head of Product — Nimbus",
    authorImage: "/images/portfolio/testimonial-maya-prasetyo.png",
  },
];

export const FALLBACK_CONTACT_CARDS: ContactCard[] = [
  { key: "Availability", value: "Open for **freelance** & long-term" },
  { key: "Based in", value: "Jakarta, Indonesia — GMT+7" },
  { key: "Response time", value: "Usually within **24 hours**" },
];

export const FALLBACK_SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", url: "https://github.com" },
  { label: "LinkedIn", url: "https://linkedin.com" },
  { label: "Dribbble", url: "https://dribbble.com" },
  { label: "X / Twitter", url: "https://x.com" },
  { label: "Instagram", url: "https://instagram.com" },
];
