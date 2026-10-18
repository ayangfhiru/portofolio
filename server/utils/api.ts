import type { ApiResponse } from "~~/app/types/api";
import type { ProjectCategory } from "~~/app/types/project";
import { ok, fail } from "./response";

/**
 * Helper lapisan API.
 *
 * Berisi dua hal yang dibutuhkan endpoint tapi TIDAK ada hubungannya
 * dengan koneksi database (lihat `db.ts`):
 * - `withFallback`  → menjalankan query DB, dengan data cadangan bila gagal
 * - `normalizeCategory` → menormalkan enum Prisma menjadi huruf kecil
 */

/**
 * Jalankan query database, dan bila gagal (mis. DB belum aktif atau
 * tabel belum di-migrate) kembalikan data fallback supaya halaman
 * tetap bisa dirender untuk pratinjau lokal.
 *
 * Di production fallback bisa dimatikan lewat env
 * `ENABLE_FALLBACK_DATA=false` sehingga kegagalan database terlihat
 * jelas, bukan diam-diam tertutupi.
 */
export const withFallback = async <T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<ApiResponse<T>> => {
  try {
    return ok(await query());
  } catch (error) {
    console.error("[api] database query gagal:", error);

    const fallbackEnabled = process.env.ENABLE_FALLBACK_DATA !== "false";
    if (fallbackEnabled) {
      return fail(fallback, "Database tidak tersedia — menampilkan data fallback.");
    }

    throw error;
  }
};

/**
 * Prisma menyimpan kategori sebagai enum huruf besar (WEB/MOBILE/OSS).
 * Frontend memakai huruf kecil, jadi kita normalkan di layer API.
 */
export const normalizeCategory = (category: string): ProjectCategory =>
  category.toLowerCase() as ProjectCategory;
