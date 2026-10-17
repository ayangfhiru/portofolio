import { defineEventHandler } from "h3";
import { withFallback } from "../../utils/api";
import { FALLBACK_FACTS } from "../../utils/fallback";

/**
 * GET /api/facts
 * Fakta singkat pada bagian About (Based in, Timezone, ...).
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const facts = await prisma.aboutFact.findMany({ orderBy: { order: "asc" } });

    return facts.map(({ term, value }) => ({ term, value }));
  }, FALLBACK_FACTS);
});
