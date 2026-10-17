import { defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";

/**
 * DELETE /api/admin/stack-groups/:id
 * Menghapus satu grup stack.
 *
 * `StackItem` mereferensikan grup dengan `onDelete: Cascade` pada
 * skema, sehingga menghapus grup ikut menghapus seluruh item di
 * dalamnya — aturan ini sudah dideklarasikan skema sehingga penghapusan
 * diizinkan tanpa pemeriksaan tabel lain. Konsekuensinya ditegaskan
 * eksplisit pada dialog konfirmasi halaman admin.
 *
 * Respons sengaja hanya `{ id, title }`: halaman sudah menyimpan
 * `itemCount` dari baris tabelnya, jadi tidak perlu query `_count`
 * tambahan sebelum delete.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "StackGroup");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.stackGroup.delete({
      where: { id },
      select: { id: true, title: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "StackGroup",
      conflictMessage: "Grup dengan judul tersebut sudah ada.",
    });
  }
});
