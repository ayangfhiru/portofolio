import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { isSent, readAdminBody, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { collectErrors, isNonEmptyString } from "~~/server/utils/validation";
import type { StatAdmin } from "~~/app/types/stat";

/**
 * POST /api/admin/stats
 * Membuat satu statistik baru.
 *
 * Body (JSON): { label: string, value: number, suffix?: string, order?: number }
 *
 * `value` adalah bilangan bulat bebas (boleh negatif) sesuai kolom `Int`
 * tanpa batasan pada schema. `Stat` tidak memiliki unique constraint,
 * jadi duplikasi label diperbolehkan.
 *
 * Status: `201` sukses · `400` payload tidak valid · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const label = isNonEmptyString(body.label) ? body.label.trim() : "";
  const value = Number(body.value);
  const suffix = typeof body.suffix === "string" ? body.suffix.trim() : "";
  // `order` opsional — tanpa nilai dikirim, pakai default schema (0).
  const order = isSent(body, "order") ? Number(body.order) : 0;

  const errors = collectErrors({
    label: !label ? "Nama statistik wajib diisi." : undefined,
    value: !Number.isInteger(value)
      ? "Nilai harus berupa bilangan bulat."
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
    const created = await prisma.stat.create({
      data: { label, value, suffix, order },
    });

    // 201 Created — kontrak Create.
    setResponseStatus(event, 201);

    return ok<StatAdmin>(created);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Stat",
      conflictMessage: "Statistik dengan nama tersebut sudah ada.",
    });
  }
});
