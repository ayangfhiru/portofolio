import { z } from "zod";

/**
 * Kontrak validasi autentikasi (register & login).
 *
 * File ini dipakai oleh **kedua sisi**: form di klien memakai skema yang
 * sama dengan kebijakan yang dikirim ke Better Auth pada
 * `server/utils/auth.ts`. Dengan begitu validasi klien hanya mempercepat
 * umpan balik — tidak pernah menjadi satu-satunya pelindung, dan tidak
 * pernah berbeda aturan dengan yang diizinkan server.
 */

/**
 * Rentang panjang password.
 *
 * Nilai yang sama diteruskan ke Better Auth sebagai
 * `minPasswordLength` / `maxPasswordLength`, sehingga password yang
 * ditolak klien juga pasti ditolak server (dan sebaliknya).
 */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Isian form masuk. */
export const loginSchema = z.object({
  email: z.email("Masukkan alamat email yang valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

/** Isian form pendaftaran akun baru. */
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Nama lengkap wajib diisi."),
    email: z.email("Masukkan alamat email yang valid."),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`,
      )
      .max(
        PASSWORD_MAX_LENGTH,
        `Password maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

/** Nilai isian form masuk. */
export type LoginFormValues = z.infer<typeof loginSchema>;

/** Nilai isian form pendaftaran. */
export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Ubah galat Zod menjadi pemetaan `field → pesan`.
 *
 * Form hanya perlu pesan per lapangan, sehingga pesan ganda untuk satu
 * lapangan disatukan dengan spasi dan lapangan pertama yang paling awal
 * menang untuk menentukan isi pesannya.
 */
export const toFieldErrors = (
  error: z.ZodError,
  fallback = "Periksa kembali isian Anda.",
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (!errors[key]) errors[key] = issue.message;
  }

  if (Object.keys(errors).length === 0) errors.form = fallback;

  return errors;
};

/** Halaman yang hanya boleh diakses tamu (belum masuk). */
const GUEST_PATHS = ["/login", "/register"];

/**
 * Amankan tujuan `redirect` dalam alur autentikasi.
 *
 * Dua hal dijaga sekaligus:
 *
 * 1. **Open redirect** — hanya path relatif di situs yang sama yang
 *    diterima (`/admin/project`). Nilai absolut (`https://domain-lain`),
 *    protokol lain (`javascript:`), dan awalan `//` dibuang supaya login
 *    tidak menjadi celah pengalihan ke domain eksternal.
 * 2. **Loop redirect** — tujuan yang menunjuk ke halaman tamu sendiri
 *    (`/login`, `/register`) ditolak, karena pengguna yang sudah masuk
 *    akan bolak-balik antara halaman tamu dan dashboard tanpa henti.
 */
export const sanitizeRedirect = (
  value: unknown,
  fallback = "/admin",
): string => {
  if (typeof value !== "string") return fallback;

  const target = value.trim();
  if (!target.startsWith("/")) return fallback;
  if (target.startsWith("//") || target.startsWith("/\\")) return fallback;

  const pathname = target.replace(/\?.*$/, "");
  if (GUEST_PATHS.includes(pathname.replace(/\/$/, ""))) return fallback;

  return target;
};
