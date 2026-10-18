import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { isSent, readAdminBody, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { collectErrors, isNonEmptyString } from "~~/server/utils/validation";
import type { AboutFactAdmin } from "~~/app/types/fact";

/**
 * POST /api/admin/facts
 * Membuat satu fakta baru.
 *
 * Body (JSON): { term: string, value: string, order?: number }
 *
 * `term` unik di seluruh tabel — pelanggaran dijawab `409`.
 * `value` boleh memuat `**penekanan**` untuk frasa yang ditonjolkan.
 *
 * Status: `201` sukses · `400` payload tidak valid · `409` `term`
 * sudah dipakai · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const term = isNonEmptyString(body.term) ? body.term.trim() : "";
  const value = isNonEmptyString(body.value) ? body.value.trim() : "";
  // `order` opsional — tanpa nilai dikirim, pakai default schema (0).
  const order = isSent(body, "order") ? Number(body.order) : 0;

  const errors = collectErrors({
    term: !term ? "Istilah wajib diisi." : undefined,
    value: !value ? "Nilai wajib diisi." : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const created = await prisma.aboutFact.create({
      data: { term, value, order },
    });

    // 201 Created — kontrak Create.
    setResponseStatus(event, 201);

    return ok<AboutFactAdmin>(created);
  } catch (error) {
    throwPrismaError(error, {
      singular: "AboutFact",
      conflictMessage: "Fakta dengan istilah tersebut sudah ada.",
    });
  }
});
