import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { isNonEmptyString } from "../../../utils/validation";
import type { ContactCardAdmin } from "../../../../app/types/contact";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["key", "value", "order"] as const;

/**
 * PATCH /api/admin/contact-cards/:id
 * Mengubah sebagian field kartu kontak (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` key bentrok · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "ContactCard");
  const fields = await readAdminBody(event);
  const data: { key?: string; value?: string; order?: number } = {};

  if (isSent(fields, "key")) {
    const key = isNonEmptyString(fields.key) ? fields.key.trim() : "";
    if (!key) {
      throw createError({ statusCode: 400, statusMessage: "Kunci kartu kontak wajib diisi." });
    }
    data.key = key;
  }

  if (isSent(fields, "value")) {
    const value = isNonEmptyString(fields.value) ? fields.value.trim() : "";
    if (!value) {
      throw createError({ statusCode: 400, statusMessage: "Nilai kartu kontak wajib diisi." });
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
    const updated = await prisma.contactCard.update({ where: { id }, data });

    return ok<ContactCardAdmin>(updated);
  } catch (error) {
    throwPrismaError(error, {
      singular: "ContactCard",
      conflictMessage: "Kartu kontak dengan kunci tersebut sudah ada.",
    });
  }
});
