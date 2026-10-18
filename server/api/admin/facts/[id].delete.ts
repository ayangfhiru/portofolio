import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";

/**
 * DELETE /api/admin/facts/:id
 * Menghapus satu fakta.
 *
 * `AboutFact` tidak memiliki relasi keluar, sehingga penghapusan aman
 * tanpa memeriksa tabel lain.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "AboutFact");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.aboutFact.delete({
      where: { id },
      select: { id: true, term: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "AboutFact",
      conflictMessage: "Fakta dengan istilah tersebut sudah ada.",
    });
  }
});
