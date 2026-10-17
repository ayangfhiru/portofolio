/**
 * Layanan yang ditawarkan.
 *
 * Dua bentuk disengaja:
 * - `Service`        → dipakai halaman publik, hanya field tampilan
 * - `ServiceAdmin`   → dipakai tabel admin, memuat `id` dan `order`
 *
 * Endpoint publik `/api/services` sengaja tidak ikut diubah agar
 * bagian "What I do" tetap menerima bentuk yang sama seperti sebelumnya.
 */

/** Layanan yang ditawarkan. Disajikan oleh `/api/services`. */
export interface Service {
  name: string;
  description: string;
}

/** Satu baris `Service` pada tabel admin. */
export interface ServiceAdmin {
  id: string;
  name: string;
  description: string;
  /** Urutan tampil pada bagian publik — angka lebih kecil tampil lebih awal. */
  order: number;
}

/** Payload pembuatan layanan lewat `POST /api/admin/services`. */
export interface ServiceCreateInput {
  name: string;
  description: string;
  order?: number;
}

/** Payload perubahan layanan lewat `PATCH /api/admin/services/:id`. */
export interface ServiceUpdateInput {
  name?: string;
  description?: string;
  order?: number;
}

/**
 * State form `ServiceForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi dan saat membangun payload.
 */
export interface ServiceFormState {
  name: string;
  description: string;
  order: string;
}
