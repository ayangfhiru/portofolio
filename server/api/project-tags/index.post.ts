import { createError, defineEventHandler, readBody } from "h3";
import { collectErrors, isNonEmptyString } from "../../utils/validation";
import { ok } from "../../utils/response";

/**
 * POST /api/project-tags
 * Menambahkan tag baru untuk sebuah project.
 *
 * Body (JSON): { name: string, projectId: string }
 */
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) ?? {};

  const name = isNonEmptyString(body.name) ? body.name.trim() : "";
  const projectId = isNonEmptyString(body.projectId) ? body.projectId.trim() : "";

  const errors = collectErrors({
    name: !name ? "Nama tag wajib diisi." : undefined,
    projectId: !projectId ? "Project wajib dipilih." : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  const prisma = getPrismaClient();

  try {
    const tag = await prisma.projectTag.create({
      data: { name, projectId },
    });

    return ok(tag);
  } catch (error) {
    // P2002 = unique constraint (tag kembar pada project yang sama).
    // P2003 = foreign key (project tidak ditemukan).
    const code = (error as { code?: string }).code;

    if (code === "P2002") {
      throw createError({
        statusCode: 409,
        statusMessage: `Tag "${name}" sudah ada pada project tersebut.`,
      });
    }

    if (code === "P2003") {
      throw createError({
        statusCode: 404,
        statusMessage: "Project tidak ditemukan.",
      });
    }

    console.error("[api] gagal membuat tag:", error);
    throw createError({ statusCode: 500, statusMessage: "Gagal menyimpan tag." });
  }
});
