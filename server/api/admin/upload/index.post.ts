import { createError, defineEventHandler, readMultipartFormData } from "h3";
import type { MoveImageResult } from "~/types/upload";
import {
  UploadError,
  moveImage,
  ok,
  validateUploadFile,
} from "~~/server/utils";

/**
 * POST /api/admin/upload
 * Mengunggah satu file ke folder `public/` yang ditentukan pemanggil.
 *
 * Body (`multipart/form-data`):
 * - `file` — berkas yang akan dipindahkan (wajib).
 * - `path` — folder tujuan relatif terhadap `public/`, contoh
 *   `uploads/projects` (wajib). Pemanggil menentukan sendiri sehingga satu
 *   endpoint bisa melayani banyak jenis file.
 *
 * Yang dilakukan endpoint ini:
 * 1. Memvalidasi ukuran dan memastikan file bukan konten yang bisa
 *    dieksekusi browser (lihat `validateUploadFile`).
 * 2. Memindahkan file dengan nama unik (`<waktu>-<acak>.<ekstensi>`) sehingga
 *    upload berulang tidak pernah menimpa file lain — nama asli tidak
 *    dipakai untuk nama file di disk.
 * 3. **Membuat folder tujuan secara otomatis** bila belum ada di `public/`
 *    (`mkdir -p` di dalam `moveImage`), jadi tidak perlu disiapkan manual.
 *
 * Respons berisi `fileName`, `relativePath`, dan `publicUrl`. Nilai
 * `publicUrl` (mis. `/uploads/projects/1792322-1a2b3c4d.png`) itulah yang
 * disimpan ke database oleh pemanggil.
 *
 * Catatan keamanan: folder `path` divalidasi ulang oleh `moveImage`
 * (menolak path absolut, `..`, dan segmen tak valid) sehingga permintaan
 * tidak bisa menulis keluar dari `public/`.
 *
 * Status: `200` sukses · `400` input tidak valid · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);

  if (!parts) {
    throw createError({
      statusCode: 400,
      statusMessage: "Body multipart tidak valid.",
    });
  }

  const filePart = parts.find(
    (part) => part.name === "file" && part.filename !== undefined,
  );
  const pathPart = parts.find((part) => part.name === "path");

  if (!filePart) {
    throw createError({
      statusCode: 400,
      statusMessage: "File wajib dipilih.",
    });
  }

  const destination = pathPart
    ? new TextDecoder().decode(pathPart.data).trim()
    : "";

  if (!destination) {
    throw createError({
      statusCode: 400,
      statusMessage: "Folder tujuan wajib diisi.",
    });
  }

  try {
    validateUploadFile(
      filePart.type ?? "",
      filePart.data.length,
      filePart.filename ?? null,
    );

    const result: MoveImageResult = await moveImage(filePart, { destination });
    return ok<MoveImageResult>(result);
  } catch (error) {
    // `UploadError` sudah membawa pesan dan status yang layak ditampilkan.
    if (error instanceof UploadError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
      });
    }

    // Jangan bocorkan detail filesystem ke client.
    console.error("[api] gagal mengunggah file:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal mengunggah file.",
    });
  }
});
