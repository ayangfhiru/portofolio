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

/**
 * Satu baris `Experience` pada tabel admin.
 *
 * Berbeda dengan tipe publik, tabel admin memuat `id` dan `order` serta
 * `points` berupa daftar teks yang diambil dari tabel anak
 * `ExperiencePoint` (urut sesuai kolom `order`).
 */
export interface ExperienceAdmin {
  id: string;
  role: string;
  /** Teks tampilan, mis. "2023 — Present". */
  dateLabel: string;
  company: string;
  description: string;
  /** Urutan tampil — angka lebih kecil tampil lebih awal. */
  order: number;
  /** Poin pendukung, urut sesuai `ExperiencePoint.order`. */
  points: string[];
}

/** Payload pembuatan pengalaman lewat `POST /api/admin/experiences`. */
export interface ExperienceCreateInput {
  role: string;
  dateLabel: string;
  company: string;
  description: string;
  order?: number;
  points?: string[];
}

/** Payload perubahan pengalaman lewat `PATCH /api/admin/experiences/:id`. */
export interface ExperienceUpdateInput {
  role?: string;
  dateLabel?: string;
  company?: string;
  description?: string;
  order?: number;
  points?: string[];
}

/**
 * State form `ExperienceForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi. `points` berupa daftar baris yang bisa ditambah/dihapus
 * pengguna, disinkronkan ulang oleh server saat disimpan.
 */
export interface ExperienceFormState {
  role: string;
  dateLabel: string;
  company: string;
  description: string;
  order: string;
  points: string[];
}
