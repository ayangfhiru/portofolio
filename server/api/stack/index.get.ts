import { defineEventHandler } from "h3";
import { withFallback } from "~~/server/utils/api";
import { FALLBACK_STACK } from "~~/server/utils/fallback";

/**
 * GET /api/stack
 * Grup tech stack beserta item di dalamnya.
 * Menghindari N+1 dengan mengambil semua item lalu mengelompokkan
 * di memori (jumlah data kecil dan tetap).
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const groups = await prisma.stackGroup.findMany({
      orderBy: { order: "asc" },
      include: { items: { orderBy: { order: "asc" } } },
    });

    // Item dipetakan menjadi daftar nama saja (string[]),
    // sesuai tipe `StackGroup` yang dipakai frontend.
    return groups.map((group) => ({
      title: group.title,
      items: group.items.map((item) => item.name),
    }));
  }, FALLBACK_STACK);
});
