import { defineEventHandler } from "h3";
import { withFallback } from "../../utils/api";
import { FALLBACK_SERVICES } from "../../utils/fallback";

/**
 * GET /api/services
 * Daftar layanan pada bagian "What I do".
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

    return services.map(({ name, description }) => ({ name, description }));
  }, FALLBACK_SERVICES);
});
