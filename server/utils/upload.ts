import type { MultiPartData } from "h3";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { MoveImageOptions, MoveImageResult } from "~~/app/types/upload";

/**
 * Util upload file.
 *
 * Semua tulis-file melewati satu fungsi reusable, `moveImage`, sehingga
 * endpoint upload lain cukup memanggilnya dengan folder tujuan yang berbeda
 * tanpa menyalin implementasi filesystem.
 *
 * File disimpan di bawah folder `public/` sehingga Nitro menyajikannya
 * sebagai file statis dan browser dapat memuatnya langsung. Folder tujuan
 * yang belum ada dibuat otomatis oleh `moveImage`, jadi pemanggil cukup
 * menentukan path tujuan tanpa menyiapkan direktori terlebih dahulu.
 *
 * Fungsi di file ini bersifat generik (boleh dipakai untuk jenis file
 * apa pun), kecuali `validateImageFile` yang sengaja membatasi ke gambar
 * karena dipakai endpoint project yang memang hanya menerima gambar.
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
 * MIME dan ekstensi yang DITOLAK pada upload generik.
 *
 * File di folder `public/` disajikan Nitro ke domain yang sama dengan
 * aplikasi, sehingga konten yang bisa dieksekusi browser (HTML, SVG, skrip)
 * berpotensi menjadi stored XSS. Karena itu daftar ini memakai pendekatan
 * deny-list ketat untuk hal yang bisa dijalankan, dan tetap mengizinkan
 * jenis file biasa (gambar, dokumen, data, arsip).
 */
const BLOCKED_MIME_TYPES = new Set([
  "text/html",
  "application/xhtml+xml",
  "image/svg+xml",
  "image/svg",
  "text/xml",
  "application/xml",
  "application/javascript",
  "text/javascript",
  "application/x-javascript",
  "application/x-sh",
  "application/x-shellscript",
  "application/x-bat",
  "application/x-msdownload",
  "application/vnd.microsoft.portable-executable",
  "application/x-executable",
  "application/x-sharedlib",
  "application/java-archive",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".html",
  ".htm",
  ".xhtml",
  ".shtml",
  ".xht",
  ".svg",
  ".svgz",
  ".xml",
  ".js",
  ".mjs",
  ".cjs",
  ".php",
  ".php3",
  ".php4",
  ".php5",
  ".phtml",
  ".phar",
  ".cgi",
  ".pl",
  ".py",
  ".rb",
  ".lua",
  ".sh",
  ".bash",
  ".zsh",
  ".fish",
  ".ksh",
  ".bat",
  ".cmd",
  ".ps1",
  ".vbs",
  ".vbe",
  ".wsf",
  ".hta",
  ".reg",
  ".exe",
  ".com",
  ".scr",
  ".msi",
  ".msp",
  ".dll",
  ".so",
  ".dylib",
  ".jar",
  ".war",
  ".ear",
  ".apk",
  ".app",
  ".dmg",
  ".deb",
  ".rpm",
]);

/**
 * Satu-satunya prefix file yang boleh dihapus oleh aplikasi.
 * Aset yang di-commit (mis. `/images/portfolio/...`) dan URL eksternal
 * berada di luar prefix ini dan karena itu tidak akan pernah disentuh.
 */
const MANAGED_PROJECT_IMAGE_PREFIX = "/uploads/projects/";

/** Sumber file yang diterima `moveImage`: bagian multipart h3 atau `File` web-standard. */
export type FileSource = MultiPartData | File;

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Baca batas ukuran upload (default 5 MB).
 *
 * `UPLOAD_MAX_FILE_MB` dipakai untuk upload generik. `UPLOAD_MAX_IMAGE_MB`
 * tetap dihormati sebagai fallback sehingga konfigurasi yang sudah ada
 * tidak berubah arti.
 */
const parseMaxUploadBytes = (): number => {
  const fromEnv = Number(
    process.env.UPLOAD_MAX_FILE_MB ?? process.env.UPLOAD_MAX_IMAGE_MB,
  );
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
  const isAbsolute =
    destination.startsWith("/") || /^[a-zA-Z]:/.test(destination);
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

/**
 * Tentukan ekstensi file final.
 *
 * Prioritas: ekstensi dari MIME → ekstensi nama file asli (bila bentuknya
 * aman) → `.bin`. `.bin` dipakai sebagai fallback netral supaya file tanpa
 * ekstensi disajikan Nitro dengan tipe konten yang tidak bisa
 * dieksekusi browser.
 */
const resolveExtension = (
  mimetype: string,
  originalName: string | null,
): string => {
  const fromMime = EXTENSION_BY_MIME[mimetype];
  if (fromMime) return fromMime;

  const fromName = extname(originalName ?? "").toLowerCase();
  if (/^\.[a-z0-9]{1,8}$/.test(fromName)) return fromName;

  return ".bin";
};

/** Normalisasi sumber file apa pun menjadi byte + metadata. */
const readFileSource = async (
  file: FileSource,
): Promise<{
  data: Uint8Array;
  mimetype: string;
  originalName: string | null;
}> => {
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
  maxImageBytes: number = parseMaxUploadBytes(),
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
 * Validasi file generik sebelum ditulis ke disk (untuk jenis file apa pun).
 *
 * Yang diperiksa:
 * 1. Ukuran, dibatasi env `UPLOAD_MAX_FILE_MB` (fallback
 *    `UPLOAD_MAX_IMAGE_MB`, default 5 MB).
 * 2. MIME type dan ekstensi yang bisa dieksekusi browser — ditolak karena
 *    file hasil upload disajikan dari domain yang sama dengan aplikasi
 *    (risiko stored XSS).
 *
 * `moveImage` TIDAK memanggil fungsi ini supaya tetap bebas dipakai untuk
 * file apa pun; validasi tetap menjadi tanggung jawab pemanggil.
 *
 * Melempar `UploadError` (400) bila tidak lolos.
 */
export const validateUploadFile = (
  mimetype: string,
  size: number,
  originalName: string | null,
  maxBytes: number = parseMaxUploadBytes(),
): void => {
  if (size > maxBytes) {
    throw new UploadError(
      `Ukuran file maksimal ${Math.round(maxBytes / 1024 / 1024)} MB.`,
    );
  }

  // Ekstensi akhir dihitung dari MIME dulu lalu nama asli, jadi keduanya
  // diperiksa agar file yang menyamar pun tetap tertolak.
  const finalExtension = resolveExtension(mimetype, originalName).toLowerCase();
  const originalExtension = extname(originalName ?? "").toLowerCase();
  const isBlocked =
    BLOCKED_MIME_TYPES.has(mimetype) ||
    BLOCKED_EXTENSIONS.has(finalExtension) ||
    BLOCKED_EXTENSIONS.has(originalExtension);

  if (isBlocked) {
    throw new UploadError(
      `Tipe file "${mimetype || originalName || "tidak diketahui"}" tidak diizinkan karena bisa dieksekusi oleh browser.`,
    );
  }
};

/**
 * Simpan satu file ke folder upload yang ditentukan.
 *
 * Fungsi ini bertanggung jawab atas hal-hal berikut sehingga endpoint upload
 * lain tidak perlu mengulanginya:
 * 1. Memvalidasi nama file dan folder tujuan.
 * 2. Membuat folder tujuan secara otomatis bila belum ada.
 * 3. Menulis file dengan nama unik untuk menghindari bentrok antar upload.
 * 4. Mengembalikan nama file dan path yang siap disimpan ke database.
 *
 * Validasi MIME type dan ukuran tetap menjadi tanggung jawab pemanggil
 * melalui `validateImageFile` (untuk gambar) atau `validateUploadFile`
 * (untuk file generik), agar `moveImage` dapat dipakai untuk jenis file
 * lain tanpa dipaksa mengikuti allowlist gambar.
 *
 * Melempar `UploadError` bila folder tujuan tidak aman.
 */
export const moveImage = async (
  file: FileSource,
  options: MoveImageOptions,
): Promise<MoveImageResult> => {
  const destination = assertSafeDestination(options.destination);
  const { data, mimetype, originalName } = await readFileSource(file);

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
  maxImageBytes: number = parseMaxUploadBytes(),
): Promise<string> => {
  validateImageFile(part.type ?? "", part.data.length, maxImageBytes);

  const { publicUrl } = await moveImage(part, {
    destination: PROJECT_UPLOAD_DIR,
  });
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
    console.warn(
      "[upload] berkas gambar lama tidak bisa dihapus:",
      relative,
      error,
    );
  }
};
