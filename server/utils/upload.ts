import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { MultiPartData } from "h3";

/**
 * Util upload gambar untuk project.
 *
 * Gambar yang di-upload disimpan ke folder `public/uploads/projects/`
 * sehingga bisa diakses langsung sebagai URL statis oleh browser.
 *
 * Catatan: `readMultipartFormData` (h3) mengembalikan `MultiPartData`
 * dengan properti `type` untuk MIME, `data` untuk isi berkas,
 * dan `filename` untuk nama aslinya.
 *
 * Di production, pertimbangkan mengganti penyimpanan lokal ini dengan
 * object storage (S3/Cloudinary) — cukup ganti isi `saveProjectImage`.
 */

/** Tipe file gambar yang diizinkan. */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

/** Ekstensi yang diizinkan (dipakai untuk menamai file). */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

/** Folder publik relatif terhadap root proyek. */
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "projects");

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/** Baca batas ukuran gambar dari env `UPLOAD_MAX_IMAGE_MB` (default 5 MB). */
const parseMaxImageBytes = (): number => {
  const fromEnv = Number(process.env.UPLOAD_MAX_IMAGE_MB);
  return Number.isFinite(fromEnv) && fromEnv > 0
    ? fromEnv * 1024 * 1024
    : 5 * 1024 * 1024;
};

/**
 * Simpan satu file gambar ke folder upload dan kembalikan URL publiknya.
 * Melempar `UploadError` bila tipe atau ukuran file tidak diizinkan.
 *
 * `maxImageBytes` bisa dioverride lewat env `UPLOAD_MAX_IMAGE_MB`.
 */
export const saveProjectImage = async (
  part: MultiPartData,
  maxImageBytes: number = parseMaxImageBytes(),
): Promise<string> => {
  const mimetype = part.type ?? "";

  if (!ALLOWED_MIME_TYPES.has(mimetype)) {
    throw new UploadError(
      `Tipe file "${mimetype || "tidak diketahui"}" tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau AVIF.`,
    );
  }

  const size = part.data.length;
  if (size > maxImageBytes) {
    throw new UploadError(
      `Ukuran gambar maksimal ${Math.round(maxImageBytes / 1024 / 1024)} MB.`,
    );
  }

  const extension =
    EXTENSION_BY_MIME[mimetype] ?? extname(part.filename ?? "") ?? ".jpg";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(join(UPLOAD_DIR, filename), part.data);

  // Path ini disajikan langsung oleh Nitro dari folder `public/`.
  return `/uploads/projects/${filename}`;
};
