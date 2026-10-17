import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { isNonEmptyString } from "../../../utils/validation";
import type { Service } from "../../../../app/types/service";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["name", "description", "order"] as const;

/**
 * PATCH /api/admin/services/:id
 * Mengubah sebagian field layanan (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` nama bentrok · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "Service");
  const fields = await readAdminBody(event);
  const data: { name?: string; description?: string; order?: number } = {};

  if (isSent(fields, "name")) {
    const name = isNonEmptyString(fields.name) ? fields.name.trim() : "";
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: "Nama layanan wajib diisi." });
    }
    data.name = name;
  }

  if (isSent(fields, "description")) {
    const description = isNonEmptyString(fields.description)
      ? fields.description.trim()
      : "";
    if (!description) {
      throw createError({ statusCode: 400, statusMessage: "Deskripsi wajib diisi." });
    }
    data.description = description;
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
    const updated = await prisma.service.update({ where: { id }, data });

    return ok<Service>(updated);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Service",
      conflictMessage: "Layanan dengan nama tersebut sudah ada.",
    });
  }
});
