import { defineEventHandler } from "h3";
import { ok } from "../../../utils/response";
import type { StackItemAdmin } from "../../../../app/types/stack";

/**
 * GET /api/admin/stack-items
 *
 * Daftar item stack lengkap untuk tabel admin — memuat `id`, `order`,
 * dan `groupId` yang tidak dikirim endpoint publik `/api/stack`.
 *
 * Judul grup ikut disertakan (`groupTitle`) agar relasi dapat langsung
 * ditampilkan di tabel dan dijadikan nilai awal `BaseSelect` tanpa
 * perlu memuat ulang `StackGroup`.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const items = await prisma.stackItem.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { group: { select: { title: true } } },
  });

  const data: StackItemAdmin[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    order: item.order,
    groupId: item.groupId,
    groupTitle: item.group.title,
  }));

  return ok(data);
});
