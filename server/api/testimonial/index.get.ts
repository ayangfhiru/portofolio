import { defineEventHandler } from "h3";
import { withFallback } from "~~/server/utils/api";
import { FALLBACK_TESTIMONIALS } from "~~/server/utils/fallback";

/**
 * GET /api/testimonial
 * Testimonial yang sedang aktif (default hanya satu).
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });

    return testimonials.map(({ quote, authorName, authorRole, authorImage }) => ({
      quote,
      authorName,
      authorRole,
      authorImage,
    }));
  }, FALLBACK_TESTIMONIALS);
});
