import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";

/**
 * DELETE /api/admin/social-links/:id
 * Menghapus satu tautan sosial.
 *
 * `SocialLink` tidak memiliki relasi keluar, sehingga penghapusan aman
 * tanpa memeriksa tabel lain.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "SocialLink");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.socialLink.delete({
      where: { id },
      select: { id: true, label: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "SocialLink",
      conflictMessage: "Tautan dengan label tersebut sudah ada.",
    });
  }
});
