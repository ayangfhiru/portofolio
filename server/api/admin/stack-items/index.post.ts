import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { readAdminBody, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { collectErrors, isNonEmptyString } from "../../../utils/validation";
import type { StackItemAdmin } from "../../../../app/types/stack";

/**
 * POST /api/admin/stack-items
 * Membuat satu item stack di dalam grup tertentu.
 *
 * Body (JSON): { name: string, groupId: string, order?: number }
 *
 * `groupId` adalah foreign key ke `StackGroup.id`. Keberadaan grup
 * diperiksa terlebih dahulu sehingga relasi yang salah merespons `404`
 * dengan pesan yang jelas, bukan kegagalan database.
 *
 * Unique constraint model ini bersifat gabungan `[@@unique([groupId, name])]`,
 * sehingga nama yang sama masih diizinkan selama berada di grup berbeda.
 *
 * Status: `201` sukses · `400` payload tidak valid · `404` grup tidak
 * ditemukan · `409` nama bentrok dalam grup sama · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const name = isNonEmptyString(body.name) ? body.name.trim() : "";
  const groupId = isNonEmptyString(body.groupId) ? body.groupId.trim() : "";
  const order = Number(body.order ?? 0);

  const errors = collectErrors({
    name: !name ? "Nama item wajib diisi." : undefined,
    groupId: !groupId ? "Grup harus dipilih." : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  // Keberadaan relasi diperiksa manual agar pesan 404 jelas dan spesifik.
  const group = await prisma.stackGroup.findUnique({
    where: { id: groupId },
    select: { title: true },
  });

  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: "Grup stack tidak ditemukan.",
    });
  }

  try {
    const created = await prisma.stackItem.create({
      data: { name, groupId, order },
    });

    // 201 Created — kontrak Create.
    setResponseStatus(event, 201);

    return ok<StackItemAdmin>({ ...created, groupTitle: group.title });
  } catch (error) {
    throwPrismaError(error, {
      singular: "StackItem",
      conflictMessage: "Item dengan nama tersebut sudah ada di grup yang sama.",
    });
  }
});
