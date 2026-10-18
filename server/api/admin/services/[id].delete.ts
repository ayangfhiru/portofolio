import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";

/**
 * DELETE /api/admin/services/:id
 * Menghapus satu layanan.
 *
 * `Service` tidak memiliki relasi keluar, sehingga penghapusan aman
 * tanpa memeriksa tabel lain.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "Service");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.service.delete({
      where: { id },
      select: { id: true, name: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Service",
      conflictMessage: "Layanan dengan nama tersebut sudah ada.",
    });
  }
});
