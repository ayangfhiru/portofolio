import type { H3Event } from "h3";
import { createError } from "h3";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
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
 * `BETTER_AUTH_URL` pada `.env`, sehingga tidak ada dua tempat yang
 * bisa menyimpan rahasia dan tidak ada risiko secret ikut ter-embed ke
 * runtime config klien.
 */
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
});

/** Sesi valid hasil `auth.api.getSession`. */
type AuthSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

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
      statusMessage: "Sesi tidak valid atau sudah berakhir. Silakan masuk kembali.",
    });
  }

  return session;
};
