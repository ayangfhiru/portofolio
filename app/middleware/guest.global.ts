/**
 * Proteksi halaman tamu (global).
 *
 * Berlaku untuk `/login` dan `/register`: pengguna yang sudah punya sesi
 * aktif tidak perlu melihat form tersebut dan langsung diarahkan ke
 * dashboard admin.
 *
 * Parameter `redirect` (bila ada) diikuti, tetapi tetap melewati
 * `sanitizeRedirect` sehingga tujuan yang menunjuk ke halaman tamu
 * sendiri jatuh ke dashboard — mencegah loop redirect.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const isGuestPath = to.path === "/login" || to.path === "/register";
  if (!isGuestPath) return;

  const { verifySession } = useAuth();
  const session = await verifySession();

  if (!session) return;

  return navigateTo(sanitizeRedirect(to.query.redirect));
});
