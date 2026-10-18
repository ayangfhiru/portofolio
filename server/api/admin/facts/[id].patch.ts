import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { isNonEmptyString } from "~~/server/utils/validation";
import type { AboutFactAdmin } from "~~/app/types/fact";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["term", "value", "order"] as const;

/**
 * PATCH /api/admin/facts/:id
 * Mengubah sebagian field fakta (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` `term` bentrok · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "AboutFact");
  const fields = await readAdminBody(event);
  const data: { term?: string; value?: string; order?: number } = {};

  if (isSent(fields, "term")) {
    const term = isNonEmptyString(fields.term) ? fields.term.trim() : "";
    if (!term) {
      throw createError({ statusCode: 400, statusMessage: "Istilah wajib diisi." });
    }
    data.term = term;
  }

  if (isSent(fields, "value")) {
    const value = isNonEmptyString(fields.value) ? fields.value.trim() : "";
    if (!value) {
      throw createError({ statusCode: 400, statusMessage: "Nilai wajib diisi." });
    }
    data.value = value;
  }

  if (isSent(fields, "order")) {
    const order = Number(fields.order);
    if (!Number.isInteger(order) || order < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Urutan harus berupa bilangan bulat nol atau lebih.",
      });
    }
    data.order = order;
  }

  // Pengiriman tanpa field apa pun bukan kesalahan validasi,
  // tetapi tetap ditolak agar permintaan yang salah ketik terlihat jelas.
  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tidak ada field yang dikirim. Field yang dapat diubah: ${ALLOWED_FIELDS.join(", ")}.`,
    });
  }

  const prisma = getPrismaClient();

  try {
    const updated = await prisma.aboutFact.update({ where: { id }, data });

    return ok<AboutFactAdmin>(updated);
  } catch (error) {
    throwPrismaError(error, {
      singular: "AboutFact",
      conflictMessage: "Fakta dengan istilah tersebut sudah ada.",
    });
  }
});
