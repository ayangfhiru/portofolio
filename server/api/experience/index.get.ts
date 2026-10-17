import { defineEventHandler } from "h3";
import { withFallback } from "../../utils/api";
import { FALLBACK_EXPERIENCES } from "../../utils/fallback";

/**
 * GET /api/experience
 * Timeline karier beserta poin-poin pendukungnya.
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const experiences = await prisma.experience.findMany({
      orderBy: { order: "asc" },
      include: { points: { orderBy: { order: "asc" } } },
    });

    return experiences.map((exp) => ({
      role: exp.role,
      dateLabel: exp.dateLabel,
      company: exp.company,
      description: exp.description,
      // Poin dipetakan menjadi daftar teks biasa (string[]).
      points: exp.points.map((point) => point.text),
    }));
  }, FALLBACK_EXPERIENCES);
});
