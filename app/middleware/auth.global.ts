/**
 * Proteksi halaman privat (global).
 *
 * Berlaku untuk **seluruh** rute yang diawali `/admin`, sehingga modul
 * admin baru otomatis terlindungi tanpa perlu mengingat menambahkan
 * `definePageMeta`. Berjalan baik saat SSR maupun navigasi klien.
 *
 * Perlu diingat: ini hanya mengatur navigasi. Batas keamanan yang
 * sesungguhnya ada pada `server/middleware/auth.ts` yang memverifikasi
 * sesi di sisi server untuk setiap endpoint privat.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) return;

  const { verifySession } = useAuth();
  const session = await verifySession();

  if (session) return;

  // Simpan tujuan awal agar pengguna kembali ke halaman yang diminta
  // sesudah berhasil masuk.
  return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
});
