import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { readAdminBody, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { collectErrors, isNonEmptyString } from "../../../utils/validation";
import type { ContactCardAdmin } from "../../../../app/types/contact";

/**
 * POST /api/admin/contact-cards
 * Membuat satu kartu kontak baru.
 *
 * Body (JSON): { key: string, value: string, order?: number }
 *
 * Status: `201` sukses · `400` payload tidak valid ·
 * `409` key sudah dipakai · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const key = isNonEmptyString(body.key) ? body.key.trim() : "";
  const value = isNonEmptyString(body.value) ? body.value.trim() : "";
  const order = Number(body.order ?? 0);

  const errors = collectErrors({
    key: !key ? "Kunci kartu kontak wajib diisi." : undefined,
    value: !value ? "Nilai kartu kontak wajib diisi." : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const created = await prisma.contactCard.create({
      data: { key, value, order },
    });

    // 201 Created — kontrak Create (lihat PROMT_ADMIN.md bagian 8).
    setResponseStatus(event, 201);

    return ok<ContactCardAdmin>(created);
  } catch (error) {
    throwPrismaError(error, {
      singular: "ContactCard",
      conflictMessage: "Kartu kontak dengan kunci tersebut sudah ada.",
    });
  }
});
