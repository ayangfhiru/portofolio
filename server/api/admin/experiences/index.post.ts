import {
  createError,
  defineEventHandler,
  setResponseStatus,
} from "h3";
import { parseStringList, readAdminBody, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { collectErrors, isNonEmptyString } from "~~/server/utils/validation";
import type { ExperienceAdmin } from "~~/app/types/experience";

/**
 * POST /api/admin/experiences
 * Membuat satu pengalaman beserta poin-poin pendukungnya.
 *
 * Body (JSON):
 * {
 *   role: string,
 *   dateLabel: string,
 *   company: string,
 *   description: string,
 *   order?: number,
 *   points?: string[],
 * }
 *
 * `Experience` dan `ExperiencePoint` dibuat dalam SATU transaksi sehingga
 * pengalaman tidak pernah tersimpan tanpa poinnya ketika pembuatan poin
 * gagal di tengah jalan.
 *
 * `points` adalah teks-teks yang disusun urut; `ExperiencePoint.order`
 * ditulis dari indeksnya, sehingga urutan tampil mengikuti urutan array.
 *
 * Status: `201` sukses · `400` payload tidak valid · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  const role = isNonEmptyString(body.role) ? body.role.trim() : "";
  const dateLabel = isNonEmptyString(body.dateLabel)
    ? body.dateLabel.trim()
    : "";
  const company = isNonEmptyString(body.company) ? body.company.trim() : "";
  const description = isNonEmptyString(body.description)
    ? body.description.trim()
    : "";
  const order = Number(body.order ?? 0);
  // `points` opsional — tanpa nilai dikirim, dianggap daftar kosong.
  const points =
    body.points === undefined ? [] : parseStringList(body.points, "Poin");

  const errors = collectErrors({
    role: !role ? "Jabatan wajib diisi." : undefined,
    dateLabel: !dateLabel ? "Label tanggal wajib diisi." : undefined,
    company: !company ? "Nama perusahaan wajib diisi." : undefined,
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
    const created = await prisma.$transaction(async (tx) => {
      const experience = await tx.experience.create({
        data: { role, dateLabel, company, description, order },
      });

      if (points.length > 0) {
        await tx.experiencePoint.createMany({
          data: points.map((text, index) => ({
            text,
            order: index,
            experienceId: experience.id,
          })),
        });
      }

      return experience;
    });

    // 201 Created — kontrak Create.
    setResponseStatus(event, 201);

    return ok<ExperienceAdmin>({ ...created, points });
  } catch (error) {
    throwPrismaError(error, {
      singular: "Experience",
      conflictMessage: "Pengalaman tersebut sudah ada.",
    });
  }
});
