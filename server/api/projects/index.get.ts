import { defineEventHandler, getQuery } from "h3";
import { withFallback, normalizeCategory } from "../../utils/api";
import { FALLBACK_PROJECTS } from "../../utils/fallback";
import type { ProjectItem } from "../../../app/types/project";

/**
 * GET /api/projects
 * Daftar project portfolio, diurutkan: featured dulu lalu tahun terbaru.
 *
 * Query (opsional):
 * - `category=web|mobile|oss` — filter berdasarkan kategori.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const category =
    typeof query.category === "string" ? query.category.toLowerCase() : undefined;

  const validCategories = new Set(["web", "mobile", "oss"]);
  if (category && !validCategories.has(category)) {
    return {
      success: true,
      data: [] as ProjectItem[],
      error: `Kategori "${category}" tidak dikenal.`,
    };
  }

  return withFallback(async () => {
    const prisma = getPrismaClient();
    const projects = await prisma.project.findMany({
      where: category ? { category: category.toUpperCase() as never } : undefined,
      include: { tags: { select: { name: true } } },
      orderBy: [{ featured: "desc" }, { year: "desc" }, { order: "asc" }],
    });

    // Normalkan enum kategori (WEB/MOBILE/OSS) menjadi huruf kecil
    // sesuai tipe `ProjectItem` di frontend.
    return projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      description: project.description,
      category: normalizeCategory(project.category),
      year: project.year,
      imageUrl: project.imageUrl,
      href: project.href,
      featured: project.featured,
      tags: project.tags,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }, category ? FALLBACK_PROJECTS.filter((p) => p.category === category) : FALLBACK_PROJECTS);
});
