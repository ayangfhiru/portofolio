/**
 * Statistik hero — counter angka pendek dengan suffix.
 *
 * Model `Stat` tidak memiliki unique constraint; `order` mengatur
 * urutan tampil pada bagian Hero halaman utama.
 */

/** Satu baris `Stat` pada tabel admin. */
export interface StatAdmin {
  id: string;
  value: number;
  /** Teks pendek pendamping angka, mis. `+`, `%`, atau `rb`. */
  suffix: string;
  label: string;
  /** Urutan tampil pada bagian Hero — angka lebih kecil tampil lebih awal. */
  order: number;
}

/** Payload pembuatan statistik lewat `POST /api/admin/stats`. */
export interface StatCreateInput {
  label: string;
  value: number;
  suffix?: string;
  order?: number;
}

/** Payload perubahan statistik lewat `PATCH /api/admin/stats/:id`. */
export interface StatUpdateInput {
  label?: string;
  value?: number;
  suffix?: string;
  order?: number;
}

/**
 * State form `StatForm.vue`.
 *
 * `value` dan `order` disimpan sebagai `string` karena `BaseInput`
 * hanya menerima model `string | File | null`; konversi ke `number`
 * dilakukan saat validasi dan saat membangun payload.
 */
export interface StatFormState {
  label: string;
  value: string;
  suffix: string;
  order: string;
}
