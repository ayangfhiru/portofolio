import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { isNonEmptyString } from "../../../utils/validation";
import type { SocialLinkAdmin } from "../../../../app/types/contact";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["label", "url", "order"] as const;

/**
 * PATCH /api/admin/social-links/:id
 * Mengubah sebagian field tautan sosial (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` label bentrok · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "SocialLink");
  const fields = await readAdminBody(event);
  const data: { label?: string; url?: string; order?: number } = {};

  if (isSent(fields, "label")) {
    const label = isNonEmptyString(fields.label) ? fields.label.trim() : "";
    if (!label) {
      throw createError({ statusCode: 400, statusMessage: "Label tautan wajib diisi." });
    }
    data.label = label;
  }

  if (isSent(fields, "url")) {
    const url = isNonEmptyString(fields.url) ? fields.url.trim() : "";
    if (!url) {
      throw createError({ statusCode: 400, statusMessage: "URL tautan wajib diisi." });
    }
    data.url = url;
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
    const updated = await prisma.socialLink.update({ where: { id }, data });

    return ok<SocialLinkAdmin>(updated);
  } catch (error) {
    throwPrismaError(error, {
      singular: "SocialLink",
      conflictMessage: "Tautan dengan label tersebut sudah ada.",
    });
  }
});
