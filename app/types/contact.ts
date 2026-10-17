/**
 * Kartu informasi kontak (Availability / Based in / Response time).
 *
 * `value` adalah kalimat lengkap yang boleh memuat penanda `**penekanan**`
 * untuk frasa yang perlu di-highlight berwarna aksen.
 * Lihat `splitEmphasis` di `~/utils/format`.
 */
export interface ContactCard {
  key: string;
  value: string;
}

/** Tautan sosial media. */
export interface SocialLink {
  label: string;
  url: string;
}

/** Satu baris `ContactCard` pada tabel admin. */
export interface ContactCardAdmin {
  id: string;
  key: string;
  value: string;
  /** Urutan tampil pada bagian Contact — angka lebih kecil tampil lebih awal. */
  order: number;
}

/** Payload pembuatan kartu kontak lewat `POST /api/admin/contact-cards`. */
export interface ContactCardCreateInput {
  key: string;
  value: string;
  order?: number;
}

/** Payload perubahan kartu kontak lewat `PATCH /api/admin/contact-cards/:id`. */
export interface ContactCardUpdateInput {
  key?: string;
  value?: string;
  order?: number;
}

/**
 * State form `ContactCardForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi dan saat membangun payload.
 */
export interface ContactCardFormState {
  key: string;
  value: string;
  order: string;
}

/** Satu baris `SocialLink` pada tabel admin. */
export interface SocialLinkAdmin {
  id: string;
  label: string;
  url: string;
  /** Urutan tampil pada bagian Contact — angka lebih kecil tampil lebih awal. */
  order: number;
}

/** Payload pembuatan tautan sosial lewat `POST /api/admin/social-links`. */
export interface SocialLinkCreateInput {
  label: string;
  url: string;
  order?: number;
}

/** Payload perubahan tautan sosial lewat `PATCH /api/admin/social-links/:id`. */
export interface SocialLinkUpdateInput {
  label?: string;
  url?: string;
  order?: number;
}

/**
 * State form `SocialLinkForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi dan saat membangun payload.
 */
export interface SocialLinkFormState {
  label: string;
  url: string;
  order: string;
}
