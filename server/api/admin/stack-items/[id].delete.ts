import { createError, defineEventHandler } from "h3";
import { requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";

/**
 * DELETE /api/admin/stack-items/:id
 * Menghapus satu item stack.
 *
 * `StackItem` tidak memiliki relasi keluar — ia adalah ujung relasi
 * terhadap `StackGroup` (dengan `onDelete: Cascade` yang mengarah ke
 * sebaliknya), sehingga menghapusnya tidak berdampak pada tabel lain.
 *
 * Status: `200` sukses · `400` ID tidak valid · `404` tidak ditemukan ·
 * `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "StackItem");
  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.stackItem.delete({
      where: { id },
      select: { id: true, name: true },
    });

    return ok(deleted);
  } catch (error) {
    throwPrismaError(error, {
      singular: "StackItem",
      conflictMessage: "Item dengan nama tersebut sudah ada di grup yang sama.",
    });
  }
});
