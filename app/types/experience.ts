/**
 * Riwayat karier/pendidikan pada timeline.
 * Disajikan oleh `/api/experience`.
 *
 * `dateLabel` berupa teks tampilan (mis. "2023 — Present"), bukan tanggal,
 * sehingga bebas format. `points` adalah daftar poin pendukung.
 */
export interface Experience {
  role: string;
  dateLabel: string;
  company: string;
  description: string;
  points: string[];
}
