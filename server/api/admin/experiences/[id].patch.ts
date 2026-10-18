import { createError, defineEventHandler } from "h3";
import { isSent, parseStringList, readAdminBody, requireId, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { isNonEmptyString } from "~~/server/utils/validation";
import type { ExperienceAdmin } from "~~/app/types/experience";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = [
  "role",
  "dateLabel",
  "company",
  "description",
  "order",
  "points",
] as const;

/**
 * PATCH /api/admin/experiences/:id
 * Mengubah sebagian field pengalaman beserta poin pendukungnya (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. **Poin disinkronkan ulang** — bila `points` dikirim, seluruh
 *    `ExperiencePoint` milik pengalaman ini ditulis ulang sesuai daftar
 *    baru. Poin adalah catatan anak murni: tidak ada tabel lain yang
 *    mereferensikannya, sehingga hapus-lalu-tulis-ulang aman dan jauh
 *    lebih sederhana daripada mencocokkan id satu per satu.
 * 4. Pembaruan utama dan sinkronisasi poin berada dalam SATU transaksi,
 *    sehingga tidak pernah ada pengalaman dengan poin setengah jadi.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "Experience");
  const fields = await readAdminBody(event);
  const data: {
    role?: string;
    dateLabel?: string;
    company?: string;
    description?: string;
    order?: number;
  } = {};

  // `points` diperlakukan terpisah karena menyentuh tabel anak.
  const points = isSent(fields, "points") ? parseStringList(fields.points, "Poin") : null;

  if (isSent(fields, "role")) {
    const role = isNonEmptyString(fields.role) ? fields.role.trim() : "";
    if (!role) {
      throw createError({
        statusCode: 400,
        statusMessage: "Jabatan wajib diisi.",
      });
    }
    data.role = role;
  }

  if (isSent(fields, "dateLabel")) {
    const dateLabel = isNonEmptyString(fields.dateLabel)
      ? fields.dateLabel.trim()
      : "";
    if (!dateLabel) {
      throw createError({
        statusCode: 400,
        statusMessage: "Label tanggal wajib diisi.",
      });
    }
    data.dateLabel = dateLabel;
  }

  if (isSent(fields, "company")) {
    const company = isNonEmptyString(fields.company)
      ? fields.company.trim()
      : "";
    if (!company) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nama perusahaan wajib diisi.",
      });
    }
    data.company = company;
  }

  if (isSent(fields, "description")) {
    const description = isNonEmptyString(fields.description)
      ? fields.description.trim()
      : "";
    if (!description) {
      throw createError({
        statusCode: 400,
        statusMessage: "Deskripsi wajib diisi.",
      });
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
  if (Object.keys(data).length === 0 && points === null) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tidak ada field yang dikirim. Field yang dapat diubah: ${ALLOWED_FIELDS.join(", ")}.`,
    });
  }

  const prisma = getPrismaClient();

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.experience.update({ where: { id }, data });

      // Sinkronisasi poin hanya berjalan bila memang dikirim.
      if (points !== null) {
        await tx.experiencePoint.deleteMany({ where: { experienceId: id } });

        if (points.length > 0) {
          await tx.experiencePoint.createMany({
            data: points.map((text, index) => ({
              text,
              order: index,
              experienceId: id,
            })),
          });
        }
      }

      return await tx.experience.findUnique({
        where: { id },
        include: {
          points: { orderBy: { order: "asc" }, select: { text: true } },
        },
      });
    });

    if (!result) {
      throw createError({
        statusCode: 404,
        statusMessage: "Experience tidak ditemukan.",
      });
    }

    return ok<ExperienceAdmin>({
      id: result.id,
      role: result.role,
      dateLabel: result.dateLabel,
      company: result.company,
      description: result.description,
      order: result.order,
      points: result.points.map((point) => point.text),
    });
  } catch (error) {
    throwPrismaError(error, {
      singular: "Experience",
      conflictMessage: "Pengalaman tersebut sudah ada.",
    });
  }
});
