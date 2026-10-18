import { defineEventHandler } from "h3";
import { ok } from "~~/server/utils/response";

/**
 * GET /api/admin/facts
 *
 * Daftar fakta About lengkap untuk tabel admin — memuat `id` dan
 * `order` yang tidak dikirim endpoint publik `/api/facts`.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const facts = await prisma.aboutFact.findMany({
    orderBy: [{ order: "asc" }, { term: "asc" }],
  });

  return ok(facts);
});
