import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { readAdminBody, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { collectErrors, isNonEmptyString } from "../../../utils/validation";
import type { Service } from "../../../../app/types/service";

/**
 * POST /api/admin/services
 * Membuat satu layanan baru.
 *
 * Body (JSON): { name: string, description: string, order?: number }
 *
 * Status: `201` sukses · `400` payload tidak valid ·
 * `409` nama sudah dipakai · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const name = isNonEmptyString(body.name) ? body.name.trim() : "";
  const description = isNonEmptyString(body.description)
    ? body.description.trim()
    : "";
  const order = Number(body.order ?? 0);

  const errors = collectErrors({
    name: !name ? "Nama layanan wajib diisi." : undefined,
    description: !description ? "Deskripsi wajib diisi." : undefined,
    order: !Number.isInteger(order) || order < 0
      ? "Urutan harus berupa bilangan bulat nol atau lebih."
      : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const created = await prisma.service.create({
      data: { name, description, order },
    });

    // 201 Created — kontrak Create (lihat PROMT_ADMIN.md bagian 8).
    setResponseStatus(event, 201);

    return ok<Service>(created);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Service",
      conflictMessage: "Layanan dengan nama tersebut sudah ada.",
    });
  }
});
