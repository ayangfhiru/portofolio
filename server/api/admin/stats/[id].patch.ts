import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { isNonEmptyString } from "~~/server/utils/validation";
import type { StatAdmin } from "~~/app/types/stat";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["label", "value", "suffix", "order"] as const;

/**
 * PATCH /api/admin/stats/:id
 * Mengubah sebagian field statistik (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "Stat");
  const fields = await readAdminBody(event);
  const data: {
    label?: string;
    value?: number;
    suffix?: string;
    order?: number;
  } = {};

  if (isSent(fields, "label")) {
    const label = isNonEmptyString(fields.label) ? fields.label.trim() : "";
    if (!label) {
      throw createError({ statusCode: 400, statusMessage: "Nama statistik wajib diisi." });
    }
    data.label = label;
  }

  if (isSent(fields, "value")) {
    const value = Number(fields.value);
    if (!Number.isInteger(value)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nilai harus berupa bilangan bulat.",
      });
    }
    data.value = value;
  }

  if (isSent(fields, "suffix")) {
    if (typeof fields.suffix !== "string") {
      throw createError({ statusCode: 400, statusMessage: "Suffix harus berupa teks." });
    }
    data.suffix = fields.suffix.trim();
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
    const updated = await prisma.stat.update({ where: { id }, data });

    return ok<StatAdmin>(updated);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Stat",
      conflictMessage: "Statistik dengan nama tersebut sudah ada.",
    });
  }
});
