/**
 * Tipe untuk identitas pemilik portfolio (hero + about + kontak).
 * Disajikan oleh `/api/profile`.
 */
export interface Profile {
  fullName: string;
  brand: string;
  role: string;
  // Hero
  availabilityText: string;
  heroLead: string;
  rotatingWords: string[];
  photoUrl: string;
  photoTagline: string;
  // About
  aboutNote: string;
  aboutParagraphs: string[];
  badgeValue: string;
  badgeLabel: string;
  // Contact
  contactSubtitle: string;
  contactEmail: string;
  contactCallUrl: string | null;
}

/**
 * Profil pada halaman kelola — `Profile` beserta kuncinya.
 *
 * Berbeda dengan seluruh modul lain, profil adalah **singleton**: hanya
 * ada satu baris dan `id`-nya selalu `"singleton"`. Karena itu tidak ada
 * tipe Create / Update terpisah — penyimpanan selalu menulis ulang
 * keseluruhan baris melalui upsert.
 */
export interface ProfileAdmin extends Profile {
  id: string;
}

/**
 * Payload penyimpanan profil lewat `PUT /api/admin/profile`.
 *
 * `contactCallUrl` bertipe `string | null` — `null` dipakai saat kolom
 * sengaja dikosongkan, sesuai tipe nullable pada schema.
 */
export interface ProfileUpdateInput {
  fullName: string;
  brand: string;
  role: string;
  availabilityText: string;
  heroLead: string;
  rotatingWords: string[];
  photoUrl: string;
  photoTagline: string;
  aboutNote: string;
  aboutParagraphs: string[];
  badgeValue: string;
  badgeLabel: string;
  contactSubtitle: string;
  contactEmail: string;
  contactCallUrl: string | null;
}

/**
 * State form `ProfileForm.vue`.
 *
 * Seluruh nilai berbentuk `string` karena `BaseInput` dan `BaseTextarea`
 * hanya menerima model `string | File | null`. Daftar (`rotatingWords`,
 * `aboutParagraphs`) tetap `string[]`. `contactCallUrl` memakai string
 * kosong sebagai penanda "tanpa tautan panggilan" dan dikonversi menjadi
 * `null` saat payload dibangun.
 */
export interface ProfileFormState {
  fullName: string;
  brand: string;
  role: string;
  availabilityText: string;
  heroLead: string;
  rotatingWords: string[];
  photoUrl: string;
  photoTagline: string;
  aboutNote: string;
  aboutParagraphs: string[];
  badgeValue: string;
  badgeLabel: string;
  contactSubtitle: string;
  contactEmail: string;
  contactCallUrl: string;
}

/** Statistik hero dengan counter. Disajikan oleh `/api/stats`. */
export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

/**
 * Fakta singkat pada bagian About (Based in, Timezone, ...).
 * `value` boleh memuat penanda `**penekanan**` — lihat `splitEmphasis`.
 * Disajikan oleh `/api/facts`.
 */
export interface AboutFact {
  term: string;
  value: string;
}
