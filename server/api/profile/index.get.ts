import { defineEventHandler } from "h3";
import { withFallback } from "~~/server/utils/api";
import { FALLBACK_PROFILE } from "~~/server/utils/fallback";

/**
 * GET /api/profile
 * Identitas pemilik portfolio (hero, about, kontak).
 * Data singleton — hanya ada satu baris di database.
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });

    if (!profile) {
      // Belum di-seed — kembalikan fallback tanpa dianggap error.
      return FALLBACK_PROFILE;
    }

    return profile;
  }, FALLBACK_PROFILE);
});
