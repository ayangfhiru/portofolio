import { defineEventHandler } from "h3";
import { ok } from "../../../utils/response";
import type { ExperienceAdmin } from "../../../../app/types/experience";

/**
 * GET /api/admin/experiences
 *
 * Daftar pengalaman lengkap untuk tabel admin — memuat `id`, `order`,
 * dan `points` yang tidak dikirim endpoint publik `/api/experience`.
 *
 * Poin pendukung diambil dari tabel anak `ExperiencePoint` lalu
 * dipipihkan menjadi daftar teks sesuai urutannya, sehingga klien tidak
 * perlu menangani struktur relasi secara manual.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const experiences = await prisma.experience.findMany({
    orderBy: [{ order: "asc" }, { role: "asc" }],
    include: {
      points: { orderBy: { order: "asc" }, select: { text: true } },
    },
  });

  const data: ExperienceAdmin[] = experiences.map((experience) => ({
    id: experience.id,
    role: experience.role,
    dateLabel: experience.dateLabel,
    company: experience.company,
    description: experience.description,
    order: experience.order,
    points: experience.points.map((point) => point.text),
  }));

  return ok(data);
});
