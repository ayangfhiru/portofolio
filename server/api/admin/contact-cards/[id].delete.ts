import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";

/**
 * DELETE /api/admin/contact-cards/:id
 * Menghapus satu kartu kontak.
 *
 * `ContactCard` tidak memiliki relasi keluar, sehingga penghapusan aman
 * tanpa memeriksa tabel lain.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "ContactCard");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.contactCard.delete({
      where: { id },
      select: { id: true, key: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "ContactCard",
      conflictMessage: "Kartu kontak dengan kunci tersebut sudah ada.",
    });
  }
});
