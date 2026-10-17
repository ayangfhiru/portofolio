/**
 * Format utilitarian yang dipakai di banyak tempat.
 * Semua fungsi memakai `const` arrow function sesuai konvensi proyek.
 */

/** Format jam WIB (Asia/Jakarta) dengan format 24 jam. */
export const formatJakartaClock = (date: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
};

/** Angka tahun berjalan — dipakai footer. */
export const getCurrentYear = (): number => new Date().getFullYear();

/**
 * Satu bagian teks hasil pemecahan penanda penekanan.
 * `emphasized: true` artinya bagian ini perlu ditonjolkan
 * (bold, warna aksen, dsb. — tergantung konteks komponen).
 */
export interface EmphasisPart {
  text: string;
  emphasized: boolean;
}

/**
 * Pecah teks yang memuat penanda `**penekanan**` menjadi bagian-bagian
 * siap render, sehingga konten dari database tetap bisa menampilkan
 * frasa yang ditebalkan/diwarnai tanpa perlu menyimpan HTML mentah.
 *
 * Contoh:
 *   "Jakarta, **Indonesia**"
 *   → [{ text: "Jakarta, ", emphasized: false },
 *      { text: "Indonesia", emphasized: true }]
 *
 * Penanda yang tidak tertutup akan tampil apa adanya (tidak error).
 */
export const splitEmphasis = (text: string): EmphasisPart[] =>
  text
    .split(/\*\*([^*]+)\*\*/g)
    // Index diambil SEBELUM filter agar penanda tetap terbaca benar
    // walau ada potongan kosong di awal/akhir.
    .map((part, index) => ({ text: part, emphasized: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);

/** Versi singkat: hanya ambil teks tanpa penanda penekanan. */
export const stripEmphasis = (text: string): string => text.replace(/\*\*/g, "");

/**
 * Ubah input tag berbentuk teks bebas (`"vue, nuxt, prisma"`)
 * menjadi daftar tag yang bersih: tiap potongan di-trim, yang kosong
 * dibuang, dan duplikat dihilangkan (urutan pertama dipertahankan).
 */
export const parseTagInput = (text: string): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of text.split(",")) {
    const name = raw.trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
};

/**
 * Hitung persentase progres scroll dokumen (0–100).
 * Mengembalikan 0 bila tinggi konten sama dengan viewport.
 */
export const calculateScrollProgress = (
  scrollY: number,
  viewportHeight: number,
  documentHeight: number,
): number => {
  const max = documentHeight - viewportHeight;
  return max > 0 ? (scrollY / max) * 100 : 0;
};

/**
 * Format tanggal Indonesia, mis. `"14 Feb 2026"`.
 * Nilai yang tidak terbaca dikembalikan apa adanya.
 */
export const formatDate = (value: string | Date): string => {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return typeof value === "string" ? value : "";
  }
};

/** Format jam Indonesia dengan akhiran WIB, mis. `"19.38 WIB"`. */
export const formatTime = (value: string | Date): string => {
  try {
    return (
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date(value)) + " WIB"
    );
  } catch {
    return "";
  }
};

/** Satu bagian teks hasil pemecahan kata kunci pencarian. */
export interface HighlightPart {
  text: string;
  matched: boolean;
}

/**
 * Pecah teks menjadi bagian-bagian yang sebagian cocok dengan kata kunci.
 *
 * Dipakai untuk menandai hasil pencarian tanpa `v-html` — pemanggil
 * merender tiap bagian sebagai elemen terpisah, sehingga tidak ada
 * risiko penyisipan HTML dari data pengguna.
 *
 * Contoh: `("Nimbus Analytics", "nim")`
 * → [{ text: "Nim", matched: true }, { text: "bus Analytics", matched: false }]
 */
export const highlightParts = (text: string, query: string): HighlightPart[] => {
  const keyword = query.trim();
  if (!keyword) return [{ text, matched: false }];

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return text
    .split(new RegExp(`(${escaped})`, "i"))
    // Index ganjil = potongan yang menjadi hasil pencarian.
    .map((part, index) => ({ text: part, matched: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);
};
