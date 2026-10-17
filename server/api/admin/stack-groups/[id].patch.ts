import { createError, defineEventHandler } from "h3";
import { isSent, readAdminBody, requireId, throwPrismaError } from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { isNonEmptyString } from "../../../utils/validation";
import type {
  StackGroupAdmin,
  StackGroupUpdateInput,
} from "../../../../app/types/stack";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["title", "order"] as const;

/**
 * PATCH /api/admin/stack-groups/:id
 * Mengubah sebagian field grup stack (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` judul bentrok · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "StackGroup");
  const fields = await readAdminBody(event);
  const data: StackGroupUpdateInput = {};

  if (isSent(fields, "title")) {
    const title = isNonEmptyString(fields.title) ? fields.title.trim() : "";
    if (!title) {
      throw createError({ statusCode: 400, statusMessage: "Judul grup wajib diisi." });
    }
    data.title = title;
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
    const group = await prisma.stackGroup.update({ where: { id }, data });

    // `_count` tidak ikut ter-select dari `update` — ambil jumlah item
    // terkini agar bentuk respons sama dengan baris hasil GET.
    const itemCount = await prisma.stackItem.count({ where: { groupId: id } });

    return ok<StackGroupAdmin>({ ...group, itemCount });
  } catch (error) {
    throwPrismaError(error, {
      singular: "StackGroup",
      conflictMessage: "Grup dengan judul tersebut sudah ada.",
    });
  }
});
