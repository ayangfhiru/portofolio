import { defineEventHandler } from "h3";
import { withFallback } from "../../utils/api";
import { FALLBACK_CONTACT_CARDS, FALLBACK_SOCIAL_LINKS } from "../../utils/fallback";

/**
 * GET /api/contact
 * Kartu informasi kontak + tautan sosial media dalam satu respons
 * karena keduanya selalu dirender bersamaan di bagian Contact.
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const [cards, socials] = await Promise.all([
      prisma.contactCard.findMany({ orderBy: { order: "asc" } }),
      prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    ]);

    return {
      cards: cards.map(({ key, value }) => ({ key, value })),
      socials: socials.map(({ label, url }) => ({ label, url })),
    };
  }, { cards: FALLBACK_CONTACT_CARDS, socials: FALLBACK_SOCIAL_LINKS });
});
