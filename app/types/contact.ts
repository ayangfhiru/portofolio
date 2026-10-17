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
