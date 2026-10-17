import {
  createError,
  defineEventHandler,
  readBody,
  readMultipartFormData,
  setResponseStatus,
} from "h3";
import { Prisma } from "../../../prisma/generated/client";
import type { ProjectCategory as ProjectCategoryEnum } from "../../../prisma/generated/enums";
import {
  collectErrors,
  isNonEmptyString,
  isPositiveInt,
  parseBoolean,
  parseTags,
  slugify,
} from "../../utils/validation";
import { UploadError, saveProjectImage } from "../../utils/upload";
import { normalizeCategory } from "../../utils/api";
import { ok } from "../../utils/response";
import type { ProjectCategory } from "../../../app/types/project";

/**
 * POST /api/projects
 * Membuat project baru beserta tag-nya.
 *
 * Mendukung dua bentuk body:
 * 1. `application/json`  — field `imageUrl` berupa URL eksternal.
 * 2. `multipart/form-data` — field `image` berupa file gambar yang
 *    akan di-upload, opsional disertai `imageUrl` sebagai cadangan.
 *
 * Field `tags` diterima sebagai array string atau string JSON
 * (berguna bila dikirim lewat multipart).
 */

const VALID_CATEGORIES = new Set(["web", "mobile", "oss"]);

export default defineEventHandler(async (event) => {
  const contentType = event.node.req.headers["content-type"] ?? "";

  let fields: Record<string, unknown> = {};
  let uploadedImage: Awaited<ReturnType<typeof saveProjectImage>> | null = null;

  // --- 1. Baca body sesuai tipe konten -------------------------------
  if (contentType.includes("multipart/form-data")) {
    const parts = await readMultipartFormData(event);
    if (!parts) {
      throw createError({ statusCode: 400, statusMessage: "Body multipart tidak valid." });
    }

    for (const part of parts) {
      if (part.filename !== undefined && part.name === "image") {
        try {
          uploadedImage = await saveProjectImage(part);
        } catch (error) {
          if (error instanceof UploadError) {
            throw createError({ statusCode: error.statusCode, statusMessage: error.message });
          }
          throw error;
        }
      } else if (part.name) {
        fields[part.name] = new TextDecoder().decode(part.data);
      }
    }
  } else {
    fields = (await readBody(event)) ?? {};
  }

  // --- 2. Validasi field wajib ----------------------------------------
  const title = typeof fields.title === "string" ? fields.title.trim() : "";
  const description =
    typeof fields.description === "string" ? fields.description.trim() : "";
  const categoryRaw =
    typeof fields.category === "string" ? fields.category.trim().toLowerCase() : "";
  const yearRaw = Number(fields.year);
  const slug =
    typeof fields.slug === "string" && fields.slug.trim()
      ? slugify(fields.slug)
      : slugify(title);

  const errors = collectErrors({
    title: !title ? "Judul wajib diisi." : undefined,
    description: !description ? "Deskripsi wajib diisi." : undefined,
    category: !VALID_CATEGORIES.has(categoryRaw)
      ? "Kategori harus web, mobile, atau oss."
      : undefined,
    year: !isPositiveInt(yearRaw) ? "Tahun harus berupa angka positif." : undefined,
    slug: !slug ? "Slug tidak bisa dibuat dari judul." : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  // --- 3. Tentukan sumber gambar --------------------------------------
  // Prioritas: file yang di-upload, lalu imageUrl dari body.
  const imageUrl =
    uploadedImage ??
    (isNonEmptyString(fields.imageUrl) ? fields.imageUrl.trim() : null);

  if (!imageUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Gambar wajib diisi — upload file atau sediakan imageUrl.",
    });
  }

  // --- 4. Simpan ke database ------------------------------------------
  const prisma = getPrismaClient();
  const tags = parseTags(fields.tags);
  const featured = parseBoolean(fields.featured);

  try {
    const project = await prisma.project.create({
      data: {
        slug,
        title,
        description,
        category: categoryRaw.toUpperCase() as ProjectCategoryEnum,
        year: yearRaw,
        imageUrl,
        href: isNonEmptyString(fields.href) ? fields.href.trim() : null,
        featured,
        tags: {
          create: tags.map((name) => ({ name })),
        },
      },
      include: { tags: true },
    });

    // 201 Created — kontrak Create (lihat PROMT_ADMIN.md bagian 8).
    setResponseStatus(event, 201);

    return ok({
      ...project,
      category: normalizeCategory(project.category),
    });
  } catch (error) {
    // Prisma error P2002 = unique constraint violation (slug kembar).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: `Project dengan slug "${slug}" sudah ada.`,
      });
    }

    console.error("[api] gagal membuat project:", error);
    throw createError({ statusCode: 500, statusMessage: "Gagal menyimpan project." });
  }
});
