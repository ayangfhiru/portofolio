import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { readAdminBody, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { collectErrors, isNonEmptyString } from "../../../utils/validation";
import type { SocialLinkAdmin } from "../../../../app/types/contact";

/**
 * POST /api/admin/social-links
 * Membuat satu tautan sosial baru.
 *
 * Body (JSON): { label: string, url: string, order?: number }
 *
 * `url` hanya divalidasi non-kosong — schema menyimpan `String` polos
 * tanpa format khusus, sehingga aturan format URL tidak dibuat di sini.
 *
 * Status: `201` sukses · `400` payload tidak valid ·
 * `409` label sudah dipakai · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const label = isNonEmptyString(body.label) ? body.label.trim() : "";
  const url = isNonEmptyString(body.url) ? body.url.trim() : "";
  const order = Number(body.order ?? 0);

  const errors = collectErrors({
    label: !label ? "Label tautan wajib diisi." : undefined,
    url: !url ? "URL tautan wajib diisi." : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const created = await prisma.socialLink.create({
      data: { label, url, order },
    });

    // 201 Created — kontrak Create (lihat PROMT_ADMIN.md bagian 8).
    setResponseStatus(event, 201);

    return ok<SocialLinkAdmin>(created);
  } catch (error) {
    throwPrismaError(error, {
      singular: "SocialLink",
      conflictMessage: "Tautan dengan label tersebut sudah ada.",
    });
  }
});
