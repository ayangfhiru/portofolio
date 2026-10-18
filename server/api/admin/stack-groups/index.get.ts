import { defineEventHandler } from "h3";
import { ok } from "~~/server/utils/response";
import type { StackGroupAdmin } from "~~/app/types/stack";

/**
 * GET /api/admin/stack-groups
 *
 * Daftar grup stack lengkap untuk tabel admin — memuat `id` dan `order`
 * yang tidak dikirim endpoint publik `/api/stack`.
 *
 * Item di dalam grup TIDAK dikirim penuh (hanya `itemCount` hasil
 * `_count`) agar daftar admin tetap ringan; halaman admin hanya perlu
 * menampilkan jumlah item, sedangkan isi item dikelola lewat modul
 * item stack.
 *
 * Sengaja TIDAK memakai `withFallback`: data cadangan sangat berbahaya
 * pada halaman kelola karena pengguna bisa mengira data palsu itu nyata
 * lalu menyuntingnya. Bila database gagal, error diteruskan apa adanya.
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();
  const groups = await prisma.stackGroup.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    include: { _count: { select: { items: true } } },
  });

  const data: StackGroupAdmin[] = groups.map((group) => ({
    id: group.id,
    title: group.title,
    order: group.order,
    itemCount: group._count.items,
  }));

  return ok(data);
});
