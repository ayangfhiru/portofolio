import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { MultiPartData } from "h3";
import type { MoveImageOptions, MoveImageResult } from "../../app/types/upload";

/**
 * Util upload gambar.
 *
 * Semua tulis-file melewati satu fungsi reusable, `moveImage`, sehingga
 * endpoint upload lain cukup memanggilnya dengan folder tujuan yang berbeda
 * tanpa menyalin implementasi filesystem.
 *
 * Gambar disimpan di bawah folder `public/` sehingga Nitro menyajikannya
 * sebagai file statis dan browser dapat memuatnya langsung.
 *
 * Di production, pertimbangkan mengganti penyimpanan lokal dengan object
 * storage (S3/Cloudinary) — cukup ganti isi `moveImage`.
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

/** Folder tujuan proyek untuk gambar project. */
const PROJECT_UPLOAD_DIR = "uploads/projects";

/**
 * Satu-satunya prefix file yang boleh dihapus oleh aplikasi.
 * Aset yang di-commit (mis. `/images/portfolio/...`) dan URL eksternal
 * berada di luar prefix ini dan karena itu tidak akan pernah disentuh.
 */
const MANAGED_PROJECT_IMAGE_PREFIX = "/uploads/projects/";

/** Sumber gambar yang diterima `moveImage`: bagian multipart h3 atau `File` web-standard. */
export type ImageSource = MultiPartData | File;

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
 * Pastikan folder tujuan berupa path relatif yang aman di bawah `public/`.
 * Menolak path absolut, separator `\`, `..`, dan segmen kosong supaya
 * tujuan tulis tidak bisa keluar dari folder publik.
 */
const assertSafeDestination = (destination: string): string => {
  const isAbsolute = destination.startsWith("/") || /^[a-zA-Z]:/.test(destination);
  // Sengaja tidak membuang segmen kosong: `uploads//x` harus ikut ditolak.
  const segments = destination.split("/");
  const isSafe =
    !isAbsolute &&
    !destination.includes("\\") &&
    segments.every((segment) => /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(segment));

  if (!isSafe) {
    throw new UploadError("Folder tujuan upload tidak valid.");
  }

  return segments.join("/");
};

/** Rapikan nama file buatan pengguna: hanya karakter aman, tanpa path, tanpa dot di depan. */
const sanitizeFileName = (name: string): string => {
  const cleaned = name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);

  return cleaned || "image";
};

/** Ekstensi file dari MIME type, dengan fallback ke ekstensi nama asli lalu `.jpg`. */
const resolveExtension = (mimetype: string, originalName: string | null): string => {
  const fromMime = EXTENSION_BY_MIME[mimetype];
  if (fromMime) return fromMime;

  const fromName = extname(originalName ?? "").toLowerCase();
  const isKnown = Object.values(EXTENSION_BY_MIME).includes(fromName);
  return isKnown ? fromName : ".jpg";
};

/** Normalisasi sumber gambar apa pun menjadi byte + metadata. */
const readImageSource = async (
  file: ImageSource,
): Promise<{ data: Uint8Array; mimetype: string; originalName: string | null }> => {
  if ("data" in file) {
    return {
      data: file.data,
      mimetype: file.type ?? "",
      originalName: file.filename ?? null,
    };
  }

  return {
    data: new Uint8Array(await file.arrayBuffer()),
    mimetype: file.type,
    originalName: file.name || null,
  };
};

/**
 * Validasi MIME type dan ukuran gambar sebelum ditulis ke disk.
 * Melempar `UploadError` (400) bila tidak lolos.
 *
 * `maxImageBytes` bisa dioverride lewat env `UPLOAD_MAX_IMAGE_MB`.
 */
export const validateImageFile = (
  mimetype: string,
  size: number,
  maxImageBytes: number = parseMaxImageBytes(),
): void => {
  if (!ALLOWED_MIME_TYPES.has(mimetype)) {
    throw new UploadError(
      `Tipe file "${mimetype || "tidak diketahui"}" tidak didukung. Gunakan JPG, PNG, WebP, GIF, atau AVIF.`,
    );
  }

  if (size > maxImageBytes) {
    throw new UploadError(
      `Ukuran gambar maksimal ${Math.round(maxImageBytes / 1024 / 1024)} MB.`,
    );
  }
};

/**
 * Simpan satu file gambar ke folder upload yang ditentukan.
 *
 * Fungsi ini bertanggung jawab atas hal-hal berikut sehingga endpoint upload
 * lain tidak perlu mengulanginya:
 * 1. Memvalidasi nama file dan folder tujuan.
 * 2. Membuat folder tujuan secara otomatis bila belum ada.
 * 3. Menulis file dengan nama unik untuk menghindari bentrok antar upload.
 * 4. Mengembalikan nama file dan path yang siap disimpan ke database.
 *
 * Validasi MIME type dan ukuran tetap menjadi tanggung jawab pemanggil
 * melalui `validateImageFile`, agar `moveImage` dapat dipakai untuk jenis
 * file lain tanpa dipaksa mengikuti allowlist gambar.
 *
 * Melempar `UploadError` bila folder tujuan tidak aman.
 */
export const moveImage = async (
  file: ImageSource,
  options: MoveImageOptions,
): Promise<MoveImageResult> => {
  const destination = assertSafeDestination(options.destination);
  const { data, mimetype, originalName } = await readImageSource(file);

  const extension = resolveExtension(mimetype, originalName);
  const baseName = options.fileName
    ? sanitizeFileName(options.fileName)
    : `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const fileName = `${baseName}${extension}`;

  // Folder dibuat otomatis supaya upload tidak gagal pada environment baru.
  const targetDir = join(process.cwd(), "public", ...destination.split("/"));
  await mkdir(targetDir, { recursive: true });
  await writeFile(join(targetDir, fileName), data);

  const relativePath = `${destination}/${fileName}`;

  return {
    fileName,
    relativePath,
    // Nilai inilah yang disimpan ke database dan dipakai sebagai `<img src>`.
    publicUrl: `/${relativePath}`,
  };
};

/**
 * Simpan gambar project dan kembalikan URL publiknya.
 * Wrapper tipis di atas `moveImage` dengan folder tujuan tetap `uploads/projects`.
 *
 * Melempar `UploadError` bila tipe atau ukuran file tidak diizinkan.
 */
export const saveProjectImage = async (
  part: MultiPartData,
  maxImageBytes: number = parseMaxImageBytes(),
): Promise<string> => {
  validateImageFile(part.type ?? "", part.data.length, maxImageBytes);

  const { publicUrl } = await moveImage(part, { destination: PROJECT_UPLOAD_DIR });
  return publicUrl;
};

/**
 * Hapus berkas gambar project lama bila sudah tidak dipakai lagi.
 *
 * Dipanggil saat sebuah project mengganti gambar. Pemanggil bertanggung jawab
 * mengisi `isStillReferenced` dengan hasil pengecekan database, karena hanya
 * pemanggil yang tahu apakah record lain masih menunjuk URL yang sama.
 *
 * Perisai yang diterapkan supaya aman dipakai berkali-kali:
 * 1. Hanya berkas di `public/uploads/projects/` yang boleh dihapus. Aset yang
 *    di-commit (`/images/...`) dan URL eksternal diabaikan begitu saja.
 * 2. Gagal menghapus berkas bukan kegagalan request — permintaan update
 *    sudah berhasil, jadi kegagalan ini hanya dicatat.
 */
export const removeManagedProjectImage = async (
  publicUrl: string,
  isStillReferenced: boolean,
): Promise<void> => {
  if (isStillReferenced) return;
  if (!publicUrl.startsWith(MANAGED_PROJECT_IMAGE_PREFIX)) return;

  const relative = publicUrl.slice(1);
  const target = join(process.cwd(), "public", ...relative.split("/"));

  try {
    await unlink(target);
  } catch (error) {
    // Berkas sudah hilang atau tidak terbaca: bukan keadaan yang perlu menggagalkan request.
    console.warn("[upload] berkas gambar lama tidak bisa dihapus:", relative, error);
  }
};
