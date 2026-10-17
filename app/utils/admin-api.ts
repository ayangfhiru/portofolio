import type { ApiResponse } from "~/types/api";

/**
 * Util pemanggilan API resource admin di sisi klien.
 *
 * Seluruh halaman admin memakai kontrak yang sama:
 * - `GET    /api/admin/<resource>`        → daftar lengkap (dengan `id`)
 * - `POST   /api/admin/<resource>`        → buat baru (201)
 * - `PATCH  /api/admin/<resource>/:id`    → ubah sebagian
 * - `DELETE /api/admin/<resource>/:id`    → hapus
 *
 * Pengecualian: modul singleton (`Profile`) tidak punya `:id` karena
 * hanya ada satu baris, sehingga penyimpanannya memakai `adminPut`
 * yang melakukan upsert pada `PUT /api/admin/<resource>`.
 *
 * Berbeda dengan endpoint publik, resource admin TIDAK memakai
 * `withFallback` — data cadangan sangat berbahaya pada halaman kelola
 * (pengguna bisa saja mengira data palsu itu nyata lalu menyuntingnya).
 * Bila database gagal, error diteruskan apa adanya.
 */

/** Ambil seluruh baris resource admin. */
export const adminList = async <T>(
  resource: string,
): Promise<ApiResponse<T[]>> =>
  await $fetch<ApiResponse<T[]>>(`/api/admin/${resource}`);

/** Buat satu record baru. */
export const adminCreate = async <T>(
  resource: string,
  payload: object,
): Promise<ApiResponse<T>> =>
  await $fetch<ApiResponse<T>>(`/api/admin/${resource}`, {
    method: "POST",
    body: payload,
  });

/**
 * Ubah sebagian field sebuah record.
 * Hanya key yang ada di `payload` yang ditulis server.
 */
export const adminPatch = async <T>(
  resource: string,
  id: string,
  payload: object,
): Promise<ApiResponse<T>> =>
  await $fetch<ApiResponse<T>>(
    `/api/admin/${resource}/${encodeURIComponent(id)}`,
    { method: "PATCH", body: payload },
  );

/** Hapus satu record. */
export const adminRemove = async (
  resource: string,
  id: string,
): Promise<ApiResponse<{ id: string }>> =>
  await $fetch<ApiResponse<{ id: string }>>(
    `/api/admin/${resource}/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

/**
 * Tulis ulang seluruh record untuk resource singleton.
 *
 * Tidak memuat `:id` karena resource semacam ini selalu berisi tepat
 * satu baris; server melakukan upsert berdasarkan tetapnya id bawaan.
 */
export const adminPut = async <T>(
  resource: string,
  payload: object,
): Promise<ApiResponse<T>> =>
  await $fetch<ApiResponse<T>>(`/api/admin/${resource}`, {
    method: "PUT",
    body: payload,
  });

/**
 * Menarik pesan yang layak ditampilkan dari error hasil `$fetch`.
 *
 * Error bawaan Nitro berbentuk `{ statusCode, statusMessage, message }`.
 * Bila tidak terbaca (mis. jaringan putus), kembalikan pesan generik
 * sehingga caller tidak perlu menangani bentuk error yang beragam.
 */
export const extractApiError = (
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
): { statusCode: number | null; message: string } => {
  if (typeof error === "object" && error !== null) {
    const source = error as {
      statusCode?: unknown;
      statusMessage?: unknown;
      data?: { statusMessage?: unknown };
      message?: unknown;
    };

    const statusCode =
      typeof source.statusCode === "number" ? source.statusCode : null;

    // Urutan prioritas: pesan bawaan Nitro → pesan dari data → message.
    const raw =
      source.statusMessage ??
      source.data?.statusMessage ??
      (typeof source.message === "string" &&
      !/^fetch failed|network error/i.test(source.message)
        ? source.message
        : undefined);

    if (typeof raw === "string" && raw.trim()) {
      return { statusCode, message: raw.trim() };
    }

    return { statusCode, message: fallback };
  }

  return { statusCode: null, message: fallback };
};
