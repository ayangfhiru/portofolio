import {
  createError,
  defineEventHandler,
  getRouterParam,
} from "h3";
import { Prisma } from "~~/prisma/generated/client";
import { ok } from "~~/server/utils/response";

/**
 * DELETE /api/projects/:id
 *
 * Menghapus satu project beserta tag-nya (relasi `tags` memakai
 * `onDelete: Cascade` di schema).
 *
 * Status:
 * - `400` bila parameter ID tidak terkirim
 * - `404` bila project tidak ditemukan
 * - `500` bila query database gagal
 *
 * Penghapusan massal dilakukan dengan memanggil endpoint ini beberapa
 * kali dari sisi klien — sengaja tidak dibuat endpoint bulk terpisah
 * agar kontrak API tetap sederhana.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID project tidak valid." });
  }

  const prisma = getPrismaClient();

  try {
    const deleted = await prisma.project.delete({
      where: { id },
      select: { id: true, title: true },
    });

    return ok(deleted);
  } catch (error) {
    // P2025 = record sudah tidak ada (dihapus oleh request lain sebelumnya).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw createError({ statusCode: 404, statusMessage: "Project tidak ditemukan." });
    }

    // Jangan bocorkan stack trace atau detail query ke client.
    console.error("[api] gagal menghapus project:", error);
    throw createError({ statusCode: 500, statusMessage: "Gagal menghapus project." });
  }
});
