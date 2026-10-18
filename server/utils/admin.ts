import type { H3Event } from "h3";
import { createError, getRouterParam, readBody } from "h3";
import { Prisma } from "~~/prisma/generated/client";

/**
 * Helper bersama untuk endpoint resource admin
 * (`/api/admin/<resource>`).
 *
 * Endpoint admin berjumlah banyak dan polanya seragam, sehingga
 * pemeriksaan parameter rute dan pemetaan error Prisma dikumpulkan di
 * sini agar status HTTP tetap konsisten dan tidak disalin berulang.
 */

/** Nama humanis sebuah model untuk dipakai pada pesan error. */
export interface AdminLabels {
  /** Mis. `"Service"` — dipakai pada pesan "Service tidak ditemukan." */
  singular: string;
  /**
   * Kalimat penuh saat input melanggar unique constraint, mis.
   * "Layanan dengan nama tersebut sudah ada."
   *
   * Ditulis manual per modul karena nama kolom mentah (`term`, `key`,
   * `groupId, name`) tidak bermakna bagi pengguna panel admin.
   */
  conflictMessage: string;
}

/**
 * Baca body request sebagai record.
 *
 * @throws `400` bila body bukan objek JSON.
 */
export const readAdminBody = async (
  event: H3Event,
): Promise<Record<string, unknown>> => {
  const body: unknown = await readBody(event);

  if (body === null || body === undefined) return {};

  if (typeof body !== "object" || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Body harus berupa objek JSON.",
    });
  }

  return body as Record<string, unknown>;
};

/**
 * Apakah sebuah key benar-benar ikut dikirim pada payload?
 *
 * Penting untuk PATCH: membedakan "field tidak dikirim" (nilai lama
 * dipertahankan) dari "field dikirim dengan nilai kosong".
 */
export const isSent = (
  fields: Record<string, unknown>,
  key: string,
): boolean => Object.prototype.hasOwnProperty.call(fields, key);

/**
 * Ambil `:id` dari rute.
 *
 * @throws `400` bila parameter tidak terkirim.
 */
export const requireId = (event: H3Event, label: string): string => {
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: `ID ${label} tidak valid.`,
    });
  }

  return id;
};

/**
 * Normalkan daftar teks dari body request.
 *
 * Dipakai kolom `String[]` (mis. `ExperiencePoint`, `rotatingWords`,
 * `aboutParagraphs`). Setiap entri dipotong dan tidak boleh kosong,
 * sehingga baris kosong akibat ketikan pengguna tidak ikut tersimpan.
 *
 * @param value Nilai dari body request.
 * @param label Nama lapang pada pesan error, mis. `"Poin"`.
 * @throws `400` bila bukan array atau ada entri yang kosong.
 */
export const parseStringList = (value: unknown, label: string): string[] => {
  if (!Array.isArray(value)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} harus berupa daftar teks.`,
    });
  }

  const items = value.map((item) =>
    typeof item === "string" ? item.trim() : "",
  );

  if (items.some((item) => !item)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Setiap ${label.toLowerCase()} wajib berisi teks.`,
    });
  }

  return items;
};

/**
 * Petakan error database ke status HTTP yang sesuai lalu lempar kembali.
 *
 * Pemetaan: * - `P2025` → 404 record sudah tidak ada
 * - `P2002` → 409 melanggar unique constraint (pakai `conflictMessage`)
 * - `P2003` → 404 relasi yang dirujuk tidak ditemukan
 * - `P2014` → 409 record masih dipakai relasi lain (tidak boleh dihapus)
 *
 * Detail query tidak pernah diteruskan ke client — hanya dicatat ke log
 * server agar penelusuran tetap mungkin tanpa membocorkan struktur DB.
 */
export const throwPrismaError = (
  error: unknown,
  labels: AdminLabels,
): never => {
  const name = labels.singular;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      throw createError({
        statusCode: 404,
        statusMessage: `${name} tidak ditemukan.`,
      });
    }

    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        statusMessage: labels.conflictMessage,
      });
    }

    if (error.code === "P2003") {
      throw createError({
        statusCode: 404,
        statusMessage: "Relasi yang dirujuk tidak ditemukan.",
      });
    }

    if (error.code === "P2014") {
      throw createError({
        statusCode: 409,
        statusMessage: `${name} masih digunakan oleh data lain dan tidak dapat dihapus.`,
      });
    }
  }

  console.error(`[api] gagal menyimpan ${name}:`, error);

  throw createError({
    statusCode: 500,
    statusMessage: `Gagal menyimpan ${name.toLowerCase()}.`,
  });
};
