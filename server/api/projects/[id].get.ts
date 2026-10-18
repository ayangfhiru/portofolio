import { createError, defineEventHandler, getRouterParam } from "h3";
import { normalizeCategory } from "~~/server/utils/api";
import { ok } from "~~/server/utils/response";

/**
 * GET /api/projects/:id
 *
 * Mengambil satu project berdasarkan ID. Dipakai khusus untuk mengisi
 * form edit (mode Update) — bukan untuk halaman daftar/read.
 *
 * Status:
 * - `400` bila parameter ID tidak terkirim
 * - `404` bila project tidak ditemukan
 * - `500` bila query database gagal
 *
 * Catatan: endpoint ini sengaja TIDAK memakai `withFallback`. Form edit
 * harus bekerja di atas data sungguhan; menampilkan data cadangan justru
 * berisiko menimpa data asli dengan data palsu.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID project tidak valid." });
  }

  const prisma = getPrismaClient();

  let project;
  try {
    project = await prisma.project.findUnique({
      where: { id },
      include: { tags: { select: { name: true }, orderBy: { name: "asc" } } },
    });
  } catch (error) {
    // Jangan bocorkan detail query/stack trace ke client.
    console.error("[api] gagal memuat project:", error);
    throw createError({ statusCode: 500, statusMessage: "Gagal memuat project." });
  }

  if (!project) {
    throw createError({ statusCode: 404, statusMessage: "Project tidak ditemukan." });
  }

  return ok({
    ...project,
    category: normalizeCategory(project.category),
  });
});
