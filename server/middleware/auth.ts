import { defineEventHandler } from "h3";
import { requireSession } from "~~/server/utils/auth";

/**
 * Guard otorisasi sisi server untuk endpoint privat.
 *
 * Middleware rute Nitro berjalan **sebelum** handler endpoint, sehingga
 * seluruh endpoint privat diverifikasi di satu tempat — tidak ada
 * endpoint baru yang bisa lupa memanggil guard, dan pemeriksaan sesi
 * tidak diduplikasi puluhan kali.
 *
 * Ini batas keamanan yang sesungguhnya. Middleware halaman pada
 * `app/middleware/` hanya mengatur kenyamanan navigasi di klien dan
 * selalu bisa dilewati, jadi tidak pernah dipakai sebagai pengganti
 * pemeriksaan ini.
 */

/** Metode yang mengubah data. Pada rute publik, hanya GET yang diizinkan. */
const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Rute privat mutlak — seluruh isi modul panel admin. */
const PRIVATE_PREFIXES = ["/api/admin"];

/**
 * Rute yang publik untuk membaca tetapi privat untuk menulis.
 *
 * `GET /api/projects` harus tetap terbuka karena dipakai SSR bagian Work
 * pada halaman utama, sementara POST/PATCH/DELETE-nya hanya dipanggil
 * panel admin.
 */
const WRITE_PROTECTED_PREFIXES = ["/api/projects", "/api/project-tags"];

/** Cocokkan path terhadap prefix, dengan batas segmen rute yang tepat. */
const matchesPrefix = (path: string, prefix: string): boolean =>
  path === prefix || path.startsWith(`${prefix}/`);

/** Buang query string agar pemakaian prefix tidak terkecoh parameter. */
const stripQuery = (path: string): string => path.replace(/\?.*$/, "");

export default defineEventHandler(async (event) => {
  const path = stripQuery(event.path);

  if (!path.startsWith("/api/")) return;
  if (matchesPrefix(path, "/api/auth")) return;

  const isPrivate =
    PRIVATE_PREFIXES.some((prefix) => matchesPrefix(path, prefix)) ||
    (WRITE_METHODS.has(event.method) &&
      WRITE_PROTECTED_PREFIXES.some((prefix) => matchesPrefix(path, prefix)));

  if (!isPrivate) return;

  await requireSession(event);
});
