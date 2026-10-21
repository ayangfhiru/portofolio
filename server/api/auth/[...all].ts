import { defineEventHandler, toWebRequest } from "h3";
import { auth } from "~~/server/utils/auth";

/**
 * Mount handler Better Auth pada `/api/auth/*`.
 *
 * Nitro bekerja dengan `Request`/`Response` standar, jadi event h3
 * diubah dulu lewat `toWebRequest` lalu diteruskan ke `auth.handler`
 * — persis pola resmi Better Auth untuk Nuxt. Seluruh rute (sign-up,
 * sign-in, sign-out, get-session, dsb.) ditangani satu file ini, sehingga
 * endpoint register/login khusus tidak dibuat.
 *
 * Route pattern `[...all]` menangkap semua metode dan semua sub-rute,
 * jadi tidak ada endpoint Better Auth yang lolos.
 */
export default defineEventHandler((event) => auth.handler(toWebRequest(event)));
