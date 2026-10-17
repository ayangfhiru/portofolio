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
