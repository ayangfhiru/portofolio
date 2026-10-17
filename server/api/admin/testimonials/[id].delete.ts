import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";

/**
 * DELETE /api/admin/testimonials/:id
 * Menghapus satu testimoni.
 *
 * `Testimonial` tidak memiliki relasi keluar, sehingga penghapusan aman
 * tanpa memeriksa tabel lain.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "Testimonial");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.testimonial.delete({
      where: { id },
      select: { id: true, authorName: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Testimonial",
      conflictMessage: "Testimoni tersebut sudah ada.",
    });
  }
});
