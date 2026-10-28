import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { H3Event } from "h3";
import { createError } from "h3";
// Impor langsung, bukan barrel `~~/utils`: barrel `app/utils` memuat
// nav dan util sisi klien yang tidak boleh ikut terbundel ke server.
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "~~/app/utils/auth-validation";
import { prisma } from "./db";

/**
 * Instance Better Auth untuk sisi server.
 *
 * Konfigurasi mengikuti pola resmi Nuxt (lihat Better Auth → Integrations
 * → Nuxt): satu instance tunggal, adapter Prisma, dan handler dipasang
 * pada `server/api/auth/[...all].ts`.
 *
 * `secret` dan `baseURL` sengaja TIDAK ditulis ulang di sini — Better
 * Auth membacanya langsung dari `BETTER_AUTH_SECRET` dan
 * `BETTER_AUTH_URL`, sehingga tidak ada dua tempat yang bisa menyimpan
 * rahasia dan tidak ada risiko secret ikut ter-embed ke runtime config
 * klien. Origin asal `BETTER_AUTH_URL` juga sudah dipercaya otomatis,
 * sehingga `trustedOrigins` di bawah hanya menambah origin tambahan.
 */

/**
 * Baca satu variabel environment tanpa mengasumsikan adanya `process.env`.
 *
 * Preset Nitro `netlify` (yang dipakai secara default) membangun Netlify
 * Functions dengan runtime Node, sehingga `process.env` tersedia. Preset
 * `netlify-edge` membangun Edge Functions di atas Deno, yang tidak
 * menyediakan `process.env` dan membaca env lewat `Deno.env`. Better Auth
 * sendiri menempuh cara yang sama, sehingga pembacaan daftar origin di
 * sini tidak pernah menyimpang dari yang dipakai library tersebut —
 * `trustedOrigins` tetap terisi walau project dipindah ke preset Edge.
 *
 * @returns Nilai variabel, atau `undefined` bila tidak tersedia.
 */
const readEnv = (key: string): string | undefined => {
  if (typeof process !== "undefined") {
    const value = process.env?.[key];
    if (value) return value;
  }

  // Runtime Deno diakses lewat objek tersendiri karena tipe global
  // `Deno` tidak tersedia pada project Node.
  const deno = (
    globalThis as typeof globalThis & {
      Deno?: { env?: { get: (key: string) => string | undefined } };
    }
  ).Deno;

  return deno?.env?.get(key);
};

/**
 * Daftar origin tambahan yang dipercaya Better Auth.
 *
 * Dipisah koma (`,`) maupun titik koma (`;`); spasi di sekitar tiap
 * entri dibuang dan entri kosong dibuang, sehingga format berikut
 * semuanya menghasilkan daftar yang sama:
 *
 * ```text
 * https://a.example,https://b.example
 * https://a.example; https://b.example
 * https://a.example , , https://b.example ,
 * ```
 *
 * Setiap entri harus berupa origin asal browser **persis** — skema, host,
 * dan port bila bukan port default; tanpa jalur dan tanpa garis miring
 * di akhir. `https://www.contoh.example` adalah origin berbeda dari
 * `https://contoh.example`, dan keduanya perlu dicantumkan bila keduanya
 * benar-benar dipakai.
 */
const readTrustedOrigins = (): string[] =>
  (readEnv("BETTER_AUTH_TRUSTED_ORIGINS") ?? "")
    .split(/[,;]/)
    .map((origin) => origin.trim())
    .filter(Boolean);

const trustedOrigins = readTrustedOrigins();

/**
 * Catat konfigurasi origin yang aktif, satu kali saat modul dimuat.
 *
 * Ketika permintaan ditolak, Better Auth hanya mencatat
 * `Invalid origin: <origin>` pada level `error`; pesan yang menyebut
 * daftar origin tepercaya dikirim ke level `info` yang dibungkam oleh
 * default logger (level `warn`). Tanpa catatan ini, 403 di production
 * tidak bisa dibedakan antara "variabel env tidak terbaca runtime" dan
 * "origin browser memang belum didaftarkan".
 *
 * Hanya informasi non-rahasia yang dicatat: daftar origin yang sudah
 * disanitasi, URL dasar publik, serta ketersediaan variabel — nilai
 * `BETTER_AUTH_SECRET` tidak pernah ikut dicetak.
 */
const logTrustedOriginConfig = (): void => {
  const origins = trustedOrigins.length > 0 ? trustedOrigins.join(", ") : "(tidak ada)";

  console.info(
    `[better-auth] Origin tepercaya tambahan: ${origins}` +
      ` | BETTER_AUTH_URL: ${readEnv("BETTER_AUTH_URL") ?? "(tidak diatur)"}` +
      ` | BETTER_AUTH_SECRET: ${readEnv("BETTER_AUTH_SECRET") ? "tersedia" : "tidak tersedia"}`,
  );
};

logTrustedOriginConfig();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Rentang yang sama dengan aturan validasi form (`auth-validation.ts`)
    // sehingga penolakan di klien selalu cocok dengan kebijakan server.
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
  },
  trustedOrigins,
});

/** Sesi valid hasil `auth.api.getSession`. */
type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

/**
 * Wajibkan sesi terautentikasi untuk sebuah request.
 *
 * Dipakai guard rute pada `server/middleware/auth.ts`. Ini satu-satunya
 * otorisasi yang berarti — middleware halaman di klien hanyalah
 * kenyamanan navigasi dan selalu bisa dilewati.
 *
 * @returns Sesi pengguna yang sedang masuk.
 * @throws `401` bila cookie tidak ada, sesi kedaluwarsa, atau sesi
 * sudah dicabut.
 */
export const requireSession = async (event: H3Event): Promise<AuthSession> => {
  const session = await auth.api.getSession({ headers: event.headers });

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage:
        "Sesi tidak valid atau sudah berakhir. Silakan masuk kembali.",
    });
  }

  return session;
};
