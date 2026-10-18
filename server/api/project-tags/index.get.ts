import { defineEventHandler } from "h3";
import { withFallback } from "~~/server/utils/api";

/**
 * GET /api/project-tags
 * Semua tag project, diurutkan abjad.
 * (Belum ada fallback khusus — kembalikan array kosong bila DB mati.)
 */
export default defineEventHandler(async () => {
  return withFallback(async () => {
    const prisma = getPrismaClient();
    const tags = await prisma.projectTag.findMany({
      select: { id: true, name: true, projectId: true },
      orderBy: { name: "asc" },
    });

    return tags;
  }, []);
});
