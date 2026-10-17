import { defineEventHandler } from "h3";
import { ok } from "../../../utils/response";

/**
 * GET /api/admin/contact-cards
 *
 * Daftar kartu kontak lengkap untuk tabel admin — memuat `id` dan `order`
 * yang tidak dikirim endpoint publik `/api/contact-cards`.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const contactCards = await prisma.contactCard.findMany({
    orderBy: [{ order: "asc" }, { key: "asc" }],
  });

  return ok(contactCards);
});
