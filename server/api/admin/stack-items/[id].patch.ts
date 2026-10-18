import { createError, defineEventHandler } from "h3";
import type { StackItemAdmin } from "../../../../app/types/stack";
import {
  readAdminBody,
  requireId,
  throwPrismaError,
} from "../../../utils/admin";
import { ok } from "../../../utils/response";
import { isNonEmptyString } from "../../../utils/validation";

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = ["name", "groupId", "order"] as const;

/**
 * PATCH /api/admin/stack-items/:id
 * Mengubah sebagian field item stack (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya `ALLOWED_FIELDS` yang boleh tertulis;
 *    `id` tidak pernah bisa diubah lewat body.
 * 2. **Hanya field yang dikirim** — key tanpa `hasOwnProperty` dilewatkan,
 *    sehingga nilai di database tidak berubah.
 * 3. **Relasi divalidasi** — `groupId` diperiksa keberadaannya terlebih
 *    dahulu sehingga pindah grup ke target yang salah merespons `404`
 *    dengan pesan jelas, bukan kegagalan database.
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` nama bentrok dalam grup sama · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const id = requireId(event, "StackItem");
  const fields = await readAdminBody(event);
  const data: {
    name?: string;
    groupId?: string;
    order?: number;
  } = {};

  if (isNonEmptyString(fields.name)) {
    const name = fields.name.trim();
    if (!name) {
      throw createError({
        statusCode: 400,
        statusMessage: "Nama item wajib diisi.",
      });
    }
    data.name = name;
  }

  if (isNonEmptyString(fields.groupId)) {
    const groupId = fields.groupId.trim();
    if (!groupId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Grup harus dipilih.",
      });
    }

    const prisma = getPrismaClient();
    const group = await prisma.stackGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw createError({
        statusCode: 404,
        statusMessage: "Grup stack tidak ditemukan.",
      });
    }

    data.groupId = groupId;
  }

  if (isPositiveInt(fields.order)) {
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
    const updated = await prisma.stackItem.update({
      where: { id },
      data,
      include: { group: { select: { title: true } } },
    });

    return ok<StackItemAdmin>({
      id: updated.id,
      name: updated.name,
      order: updated.order,
      groupId: updated.groupId,
      groupTitle: updated.group.title,
    });
  } catch (error) {
    throwPrismaError(error, {
      singular: "StackItem",
      conflictMessage: "Item dengan nama tersebut sudah ada di grup yang sama.",
    });
  }
});
