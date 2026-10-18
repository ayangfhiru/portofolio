import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { readAdminBody, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { collectErrors, isNonEmptyString } from "~~/server/utils/validation";
import type { StackGroupAdmin } from "~~/app/types/stack";

/**
 * POST /api/admin/stack-groups
 * Membuat satu grup stack baru.
 *
 * Body (JSON): { title: string, order?: number }
 *
 * Status: `201` sukses · `400` payload tidak valid · `409` judul sudah
 * dipakai grup lain · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const title = isNonEmptyString(body.title) ? body.title.trim() : "";
  const order = Number(body.order ?? 0);

  const errors = collectErrors({
    title: !title ? "Judul grup wajib diisi." : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const created = await prisma.stackGroup.create({
      data: { title, order },
    });

    // 201 Created — kontrak Create (lihat PROMT_ADMIN.md bagian 8).
    setResponseStatus(event, 201);

    // Grup baru selalu tanpa item — `itemCount` ikut dikembalikan agar
    // bentuknya sama dengan baris hasil GET.
    return ok<StackGroupAdmin>({ ...created, itemCount: 0 });
  } catch (error) {
    throwPrismaError(error, {
      singular: "StackGroup",
      conflictMessage: "Grup dengan judul tersebut sudah ada.",
    });
  }
});
