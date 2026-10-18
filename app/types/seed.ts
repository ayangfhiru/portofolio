/**
 * Kontrak hasil eksekusi seeder (`prisma/seed.ts`).
 *
 * Seeder menghitung jumlah record yang ia kelola sehingga pemanggil — baik
 * `prisma db seed` maupun skrip pengujian — dapat memastikan isi database
 * sesuai harapan tanpa membaca ulang seluruh tabel.
 */
export interface SeedResult {
  profile: number;
  stats: number;
  services: number;
  stackGroups: number;
  projects: number;
  experiences: number;
  testimonials: number;
  aboutFacts: number;
  contactCards: number;
  socialLinks: number;
}
