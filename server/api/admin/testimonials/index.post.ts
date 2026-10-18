import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { readAdminBody, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import {
  collectErrors,
  isBoolean,
  isNonEmptyString,
} from "~~/server/utils/validation";
import type { TestimonialAdmin } from "~~/app/types/testimonial";

/**
 * POST /api/admin/testimonials
 * Membuat satu testimoni baru.
 *
 * Body (JSON): { quote: string, authorName: string, authorRole: string,
 *                authorImage: string, active?: boolean, order?: number }
 *
 * Status: `201` sukses · `400` payload tidak valid · `500` kegagalan
 * server. Model `Testimonial` tanpa unique constraint, sehingga tidak
 * ada kemungkinan `409`.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const quote = isNonEmptyString(body.quote) ? body.quote.trim() : "";
  const authorName = isNonEmptyString(body.authorName)
    ? body.authorName.trim()
    : "";
  const authorRole = isNonEmptyString(body.authorRole)
    ? body.authorRole.trim()
    : "";
  const authorImage = isNonEmptyString(body.authorImage)
    ? body.authorImage.trim()
    : "";
  const active = isBoolean(body.active) ? body.active : true;
  const order = Number(body.order ?? 0);

  const errors = collectErrors({
    quote: !quote ? "Kutipan wajib diisi." : undefined,
    authorName: !authorName ? "Nama penulis wajib diisi." : undefined,
    authorRole: !authorRole ? "Jabatan penulis wajib diisi." : undefined,
    authorImage: !authorImage ? "URL foto penulis wajib diisi." : undefined,
    active: body.active !== undefined && !isBoolean(body.active)
      ? "Status tampil harus berupa boolean."
      : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const created = await prisma.testimonial.create({
      data: { quote, authorName, authorRole, authorImage, active, order },
    });

    // 201 Created — kontrak Create (lihat PROMT_ADMIN.md bagian 8).
    setResponseStatus(event, 201);

    return ok<TestimonialAdmin>(created);
  } catch (error) {
    // Model tanpa unique constraint — `conflictMessage` tetap diisi
    // agar tipe `AdminLabels` terpenuhi.
    throwPrismaError(error, {
      singular: "Testimonial",
      conflictMessage: "Testimoni tersebut sudah ada.",
    });
  }
});
