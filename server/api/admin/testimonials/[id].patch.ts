import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { isBoolean, isNonEmptyString } from "~~/server/utils/validation";
import type {
  TestimonialAdmin,
  TestimonialUpdateInput,
} from "~~/app/types/testimonial";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = [
  "quote",
  "authorName",
  "authorRole",
  "authorImage",
  "active",
  "order",
] as const;

/**
 * PATCH /api/admin/testimonials/:id
 * Mengubah sebagian field testimoni (mode Update).
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
  const id = requireId(event, "Testimonial");
  const fields = await readAdminBody(event);
  const data: TestimonialUpdateInput = {};

  if (isSent(fields, "quote")) {
    const quote = isNonEmptyString(fields.quote) ? fields.quote.trim() : "";
    if (!quote) {
      throw createError({ statusCode: 400, statusMessage: "Kutipan wajib diisi." });
    }
    data.quote = quote;
  }

  if (isSent(fields, "authorName")) {
    const authorName = isNonEmptyString(fields.authorName)
      ? fields.authorName.trim()
      : "";
    if (!authorName) {
      throw createError({ statusCode: 400, statusMessage: "Nama penulis wajib diisi." });
    }
    data.authorName = authorName;
  }

  if (isSent(fields, "authorRole")) {
    const authorRole = isNonEmptyString(fields.authorRole)
      ? fields.authorRole.trim()
      : "";
    if (!authorRole) {
      throw createError({ statusCode: 400, statusMessage: "Jabatan penulis wajib diisi." });
    }
    data.authorRole = authorRole;
  }

  if (isSent(fields, "authorImage")) {
    const authorImage = isNonEmptyString(fields.authorImage)
      ? fields.authorImage.trim()
      : "";
    if (!authorImage) {
      throw createError({ statusCode: 400, statusMessage: "URL foto penulis wajib diisi." });
    }
    data.authorImage = authorImage;
  }

  if (isSent(fields, "active")) {
    if (!isBoolean(fields.active)) {
      throw createError({ statusCode: 400, statusMessage: "Status tampil harus berupa boolean." });
    }
    data.active = fields.active;
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
    const updated = await prisma.testimonial.update({ where: { id }, data });

    return ok<TestimonialAdmin>(updated);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Testimonial",
      conflictMessage: "Testimoni tersebut sudah ada.",
    });
  }
});
