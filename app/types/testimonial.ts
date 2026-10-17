/**
 * Testimonial client yang tampil pada bagian Quote.
 *
 * Dua bentuk disengaja:
 * - `Testimonial`        → dipakai halaman publik, hanya field tampilan
 * - `TestimonialAdmin`   → dipakai tabel admin, memuat `id`, `active`, dan `order`
 */
export interface Testimonial {
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
}

/** Satu baris `Testimonial` pada tabel admin. */
export interface TestimonialAdmin {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  /** Hanya testimoni aktif yang tampil pada bagian Quote halaman utama. */
  active: boolean;
  /** Urutan tampil — angka lebih kecil tampil lebih awal. */
  order: number;
}

/** Payload pembuatan testimoni lewat `POST /api/admin/testimonials`. */
export interface TestimonialCreateInput {
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  active?: boolean;
  order?: number;
}

/** Payload perubahan testimoni lewat `PATCH /api/admin/testimonials/:id`. */
export interface TestimonialUpdateInput {
  quote?: string;
  authorName?: string;
  authorRole?: string;
  authorImage?: string;
  active?: boolean;
  order?: number;
}

/**
 * State form `TestimonialForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi dan saat membangun payload.
 */
export interface TestimonialFormState {
  quote: string;
  authorName: string;
  authorRole: string;
  authorImage: string;
  active: boolean;
  order: string;
}
