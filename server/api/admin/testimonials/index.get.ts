import { defineEventHandler } from "h3";
import { ok } from "../../../utils/response";
import type { TestimonialAdmin } from "../../../../app/types/testimonial";

/**
 * GET /api/admin/testimonials
 *
 * Daftar testimoni lengkap untuk tabel admin — memuat `id`, `active`,
 * dan `order` yang tidak dikirim endpoint publik `/api/testimonial`.
 *
 * Berbeda dengan endpoint publik, endpoint ini mengembalikan SEMUA
 * baris (termasuk yang `active: false`) agar admin tetap dapat
 * menyunting testimoni yang sedang disembunyikan.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }],
  });

  return ok<TestimonialAdmin[]>(testimonials);
});
