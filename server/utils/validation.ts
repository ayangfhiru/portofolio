/**
 * Helper validasi input sederhana tanpa dependensi eksternal.
 * Dipakai oleh endpoint POST/PATCH untuk memastikan payload valid
 * sebelum menyentuh database.
 */

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isPositiveInt = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

export const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

/**
 * Konversi string menjadi slug aman-URL.
 * Contoh: "Nimbus Analytics" → "nimbus-analytics".
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Kumpulkan string yang tidak valid menjadi pesan gabungan.
 * Mengembalikan `null` bila tidak ada error (semua valid).
 */
export const collectErrors = (
  errors: Record<string, string | undefined>,
): string | null => {
  const messages = Object.values(errors).filter(
    (message): message is string => Boolean(message),
  );
  return messages.length > 0 ? messages.join(" ") : null;
};
