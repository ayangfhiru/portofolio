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

/**
 * Ubah berbagai bentuk input `tags` menjadi array string yang bersih.
 * Menerima array, string JSON (`'["a","b"]'`), atau daftar dipisah koma
 * (`"a,b,c"`). Terakhir untuk menampung pengiriman lewat multipart.
 *
 * Duplikat dibuang tanpa membedakan huruf besar/kecil (`vue` dan `Vue`
 * dianggap sama) dan urutan kemunculan pertama dipertahankan — selaras
 * dengan `parseTagInput` di sisi klien.
 */
export const parseTags = (raw: unknown): string[] => {
  const list = Array.isArray(raw)
    ? raw.filter((item): item is string => typeof item === "string")
    : typeof raw === "string"
      ? parseTagString(raw)
      : [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of list) {
    const name = item.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
};

/** Pecah satu string tag: coba JSON array dulu, baru daftar dipisah koma. */
const parseTagString = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // Bukan JSON — jatuh ke pemrosesan daftar dipisah koma di bawah.
  }

  return raw.split(",");
};

/**
 * Normalisasi input boolean dari JSON (`true`) maupun multipart
 * (`"true"`, `"1"`). Nilai lain dikembalikan ke `fallback`.
 */
export const parseBoolean = (raw: unknown, fallback = false): boolean => {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return raw === "true" || raw === "1";
  return fallback;
};
