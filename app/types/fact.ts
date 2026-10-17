/**
 * Fakta singkat pada bagian About (Based in, Timezone, ...).
 *
 * `term` unik; `value` boleh memuat `**penekanan**` untuk frasa yang
 * ditonjolkan di halaman publik.
 */

/** Satu baris `AboutFact` pada tabel admin. */
export interface AboutFactAdmin {
  id: string;
  term: string;
  value: string;
  /** Urutan tampil pada bagian About — angka lebih kecil tampil lebih awal. */
  order: number;
}

/** Payload pembuatan fakta lewat `POST /api/admin/facts`. */
export interface AboutFactCreateInput {
  term: string;
  value: string;
  order?: number;
}

/** Payload perubahan fakta lewat `PATCH /api/admin/facts/:id`. */
export interface AboutFactUpdateInput {
  term?: string;
  value?: string;
  order?: number;
}

/**
 * State form `FactForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi dan saat membangun payload.
 */
export interface AboutFactFormState {
  term: string;
  value: string;
  order: string;
}
