import { defineEventHandler } from "h3";
import { ok } from "~~/server/utils/response";

/**
 * GET /api/admin/stats
 *
 * Daftar statistik hero lengkap untuk tabel admin — memuat `id`,
 * `suffix`, dan `order` yang tidak dikirim endpoint publik `/api/stats`.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const stats = await prisma.stat.findMany({
    orderBy: [{ order: "asc" }, { label: "asc" }],
  });

  return ok(stats);
});
