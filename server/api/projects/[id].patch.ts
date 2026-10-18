import {
  createError,
  defineEventHandler,
  getRouterParam,
  readBody,
  readMultipartFormData,
} from "h3";
import type { H3Event } from "h3";
import { Prisma } from "../../../prisma/generated/client";
import type { ProjectCategory as ProjectCategoryEnum } from "../../../prisma/generated/enums";
import { normalizeCategory } from "../../utils/api";
import { ok } from "../../utils/response";
import {
  collectErrors,
  isNonEmptyString,
  isPositiveInt,
  parseBoolean,
  parseTags,
  slugify,
} from "../../utils/validation";
import { UploadError, removeManagedProjectImage, saveProjectImage } from "../../utils/upload";
import type { ProjectCategory } from "../../../app/types/project";

/**
 * PATCH /api/projects/:id
 *
 * Mengubah sebagian field project (mode Update).
 *
 * Prinsip yang dipatuhi:
 * 1. **Allowlist** — hanya field di `ALLOWED_FIELDS` yang boleh tertulis;
 *    field lain (id, order, createdAt, ...) tidak pernah disentuh walaupun
 *    ikut dikirim.
 * 2. **Hanya field yang dikirim** — tiap key dicek dengan
 *    `hasOwnProperty`. Key yang tidak ada di payload dilewatkan begitu
 *    saja, sehingga nilainya di database tidak berubah.
 * 3. **`null` eksplisit dihormati** — `href: null` (atau `""` pada
 *    multipart) berarti mengosongkan kolom, bukan "tidak dikirim".
 * 4. Validasi hanya dijalankan terhadap field yang benar-benar dikirim.
 *
 * Menerima `application/json` maupun `multipart/form-data`
 * (bila gambar ikut diganti lewat field `image`).
 *
 * Status: `200` sukses · `400` payload tidak valid · `404` tidak
 * ditemukan · `409` slug bentrok · `500` kegagalan server.
 */

const VALID_CATEGORIES = new Set(["web", "mobile", "oss"]);

/** Field yang diizinkan berubah melalui endpoint ini. */
const ALLOWED_FIELDS = [
  "title",
  "slug",
  "description",
  "category",
  "year",
  "imageUrl",
  "href",
  "featured",
  "tags",
] as const;

type AllowedField = (typeof ALLOWED_FIELDS)[number];

/** Apakah key benar-benar ikut dikirim dalam payload? */
const isSent = (fields: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(fields, key);

/**
 * Baca body sesuai tipe konten.
 * Mengembalikan field terurai dan file gambar yang menyertainya (bila ada).
 */
const readPayload = async (
  event: H3Event,
): Promise<{
  fields: Record<string, unknown>;
  image: Awaited<ReturnType<typeof saveProjectImage>> | null;
}> => {
  const contentType = event.node.req.headers["content-type"] ?? "";

  // --- multipart: dipakai bila ada penggantian gambar -----------------
  if (contentType.includes("multipart/form-data")) {
    const parts = await readMultipartFormData(event);
    if (!parts) {
      throw createError({ statusCode: 400, statusMessage: "Body multipart tidak valid." });
    }

    const fields: Record<string, unknown> = {};
    let image: Awaited<ReturnType<typeof saveProjectImage>> | null = null;

    for (const part of parts) {
      if (part.filename !== undefined && part.name === "image") {
        try {
          image = await saveProjectImage(part);
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

    return { fields, image };
  }

  // --- JSON biasa ------------------------------------------------------
  const body: unknown = await readBody(event);
  if (body === null || body === undefined) {
    return { fields: {}, image: null };
  }

  if (typeof body !== "object" || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: "Body harus berupa objek JSON." });
  }

  return { fields: body as Record<string, unknown>, image: null };
};

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "ID project tidak valid." });
  }

  const { fields, image } = await readPayload(event);
  const prisma = getPrismaClient();

  // --- 1. Pastikan resource ada ----------------------------------------
  const existing = await findProjectOrThrow(prisma, id);

  // --- 2. Susun data dari field yang benar-benar dikirim ----------------
  const data: Partial<Record<AllowedField, unknown>> = {};
  const errors: Record<string, string | undefined> = {};

  if (isSent(fields, "title")) {
    const title = typeof fields.title === "string" ? fields.title.trim() : "";
    if (title) data.title = title;
    else errors.title = "Judul tidak boleh kosong.";
  }

  if (isSent(fields, "slug")) {
    // String kosong = biarkan server membuat slug dari judul
    // (judul yang baru bila ikut diubah, atau judul lama bila tidak).
    const raw = typeof fields.slug === "string" ? fields.slug.trim() : "";
    const source =
      typeof data.title === "string" && data.title ? data.title : existing.title;
    const slug = raw ? slugify(raw) : slugify(source);
    if (slug) data.slug = slug;
    else errors.slug = "Slug tidak bisa dibentuk dari judul.";
  }

  if (isSent(fields, "description")) {
    const description =
      typeof fields.description === "string" ? fields.description.trim() : "";
    if (description) data.description = description;
    else errors.description = "Deskripsi tidak boleh kosong.";
  }

  if (isSent(fields, "category")) {
    const category =
      typeof fields.category === "string" ? fields.category.trim().toLowerCase() : "";
    if (VALID_CATEGORIES.has(category)) {
      data.category = category.toUpperCase() as ProjectCategoryEnum;
    } else {
      errors.category = "Kategori harus web, mobile, atau oss.";
    }
  }

  if (isSent(fields, "year")) {
    // JSON mengirim number, multipart mengirim string.
    const year =
      typeof fields.year === "number" ? fields.year : Number(fields.year);
    if (isPositiveInt(year) && year <= 9999) data.year = year;
    else errors.year = "Tahun harus berupa angka 4 digit yang valid.";
  }

  // Gambar: file yang di-upload menang, lalu imageUrl dari payload.
  if (image) {
    data.imageUrl = image;
  } else if (isSent(fields, "imageUrl")) {
    if (isNonEmptyString(fields.imageUrl)) {
      data.imageUrl = fields.imageUrl.trim();
    } else {
      errors.imageUrl = "URL gambar tidak boleh kosong.";
    }
  }

  if (isSent(fields, "href")) {
    const href = fields.href;
    // null (JSON) atau "" (multipart) = mengosongkan kolom secara sengaja.
    if (href === null || href === "") {
      data.href = null;
    } else if (typeof href === "string" && href.trim()) {
      data.href = href.trim();
    } else {
      errors.href = "Tautan harus berupa teks kosong (untuk mengosongkan) atau URL.";
    }
  }

  if (isSent(fields, "featured")) {
    data.featured = parseBoolean(fields.featured, false);
  }

  if (isSent(fields, "tags")) {
    data.tags = parseTags(fields.tags);
  }

  const message = collectErrors(errors);
  if (message) {
    throw createError({ statusCode: 400, statusMessage: message });
  }

  if (Object.keys(data).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Tidak ada field yang dapat diperbarui. Field yang diizinkan: ${ALLOWED_FIELDS.join(", ")}.`,
    });
  }

  // --- 3. Terapkan perubahan -------------------------------------------
  try {
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title as string }),
        ...(data.slug !== undefined && { slug: data.slug as string }),
        ...(data.description !== undefined && {
          description: data.description as string,
        }),
        ...(data.category !== undefined && {
          category: data.category as ProjectCategoryEnum,
        }),
        ...(data.year !== undefined && { year: data.year as number }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl as string }),
        ...(data.href !== undefined && { href: data.href as string | null }),
        ...(data.featured !== undefined && { featured: data.featured as boolean }),
        // Tag diganti seluruhnya agar mencerminkan isi form.
        ...(data.tags !== undefined && {
          tags: {
            deleteMany: {},
            create: (data.tags as string[]).map((name) => ({ name })),
          },
        }),
      },
      include: { tags: { select: { name: true }, orderBy: { name: "asc" } } },
    });

    // Gambar lama dibersihkan hanya bila: (a) URL-nya benar-benar berubah,
    // (b) berkasnya berada di folder upload yang dikelola aplikasi, dan
    // (c) tidak ada project lain yang masih menunjuk URL yang sama.
    if (data.imageUrl !== undefined && data.imageUrl !== existing.imageUrl) {
      const stillUsed = await prisma.project.count({
        where: { imageUrl: existing.imageUrl, NOT: { id } },
      });
      await removeManagedProjectImage(existing.imageUrl, stillUsed > 0);
    }

    return ok({
      ...updated,
      category: normalizeCategory(updated.category),
    });
  } catch (error) {
    // P2002 = slug kembar, P2025 = record hilang (balapan dengan request lain).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: `Project dengan slug "${String(data.slug)}" sudah ada.`,
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw createError({ statusCode: 404, statusMessage: "Project tidak ditemukan." });
    }

    // Jangan bocorkan stack trace atau detail query ke client.
    console.error("[api] gagal memperbarui project:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memperbarui project.",
    });
  }
});

/**
 * Cek keberadaan project; melempar `404` bila tidak ada
 * dan `500` bila query-nya gagal.
 */
const findProjectOrThrow = async (
  prisma: ReturnType<typeof getPrismaClient>,
  id: string,
): Promise<{ id: string; title: string; imageUrl: string }> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, title: true, imageUrl: true },
    });

    if (!project) {
      throw createError({ statusCode: 404, statusMessage: "Project tidak ditemukan." });
    }

    return project;
  } catch (error) {
    // Error buatan sendiri (404) harus diteruskan apa adanya.
    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      (error as { statusCode?: number }).statusCode === 404
    ) {
      throw error;
    }

    console.error("[api] gagal memeriksa project:", error);
    throw createError({ statusCode: 500, statusMessage: "Gagal memuat project." });
  }
};
