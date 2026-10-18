import { defineEventHandler } from "h3";
import { withFallback } from "~~/server/utils/api";
import { FALLBACK_STATS } from "~~/server/utils/fallback";

/**
 * GET /api/stats
 * Statistik hero (counter angka), diurutkan sesuai `order`.
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });

    return stats.map(({ value, suffix, label }) => ({ value, suffix, label }));
  }, FALLBACK_STATS);
});
