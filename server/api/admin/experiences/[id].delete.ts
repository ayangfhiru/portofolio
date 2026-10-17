import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";

/**
 * DELETE /api/admin/experiences/:id
 * Menghapus satu pengalaman.
 *
 * `ExperiencePoint` memiliki relasi `onDelete: Cascade` terhadap
 * `Experience`, sehingga seluruh poin pendukung ikut terhapus mengikuti
 * aturan yang sudah dideklarasikan skema. Konsekuensi ini disebutkan
 * eksplisit pada dialog konfirmasi halaman admin.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "Experience");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.experience.delete({
      where: { id },
      select: { id: true, role: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Experience",
      conflictMessage: "Pengalaman tersebut sudah ada.",
    });
  }
});
