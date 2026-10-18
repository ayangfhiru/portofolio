import { createError, defineEventHandler } from "h3";
import { parseStringList, readAdminBody, throwPrismaError } from "~~/server/utils/admin";
import { ok } from "~~/server/utils/response";
import { collectErrors, isNonEmptyString } from "~~/server/utils/validation";
import type { ProfileAdmin } from "~~/app/types/profile";

/**
 * PUT /api/admin/profile
 * Menyimpan profil (upsert baris tunggal).
 *
 * Karena profil hanya satu baris, penyimpanan memakai `PUT` yang
 * menulis ulang keseluruhan record — tidak ada `POST` (create) maupun
 * `DELETE` terpisah untuk modul ini.
 *
 * Body (JSON): seluruh kolom profil.
 * - Kolom teks wajib non-kosong.
 * - `rotatingWords` dan `aboutParagraphs` adalah daftar teks; setiap
 *   entri wajib berisi teks, tetapi daftarnya boleh kosong (hero dan
 *   bagian About sudah menangani kondisi kosong).
 * - `contactCallUrl` nullable — nilai kosong atau hilang dikonversi
 *   menjadi `null` sehingga kolomnya benar-benar kosong di database.
 *
 * `id` selalu `"singleton"`, sehingga `create` dan `update` pada upsert
 * menulis baris yang sama.
 *
 * Status: `200` sukses · `400` payload tidak valid · `409` bila terjadi
 * bentrok tak terduga · `500` kegagalan server.
 */
export default defineEventHandler(async (event) => {
  const body = await readAdminBody(event);

  /** Ambil nilai teks dari body; nilai hilang menjadi string kosong. */
  const text = (value: unknown): string =>
    isNonEmptyString(value) ? value.trim() : "";

  const fullName = text(body.fullName);
  const brand = text(body.brand);
  const role = text(body.role);
  const availabilityText = text(body.availabilityText);
  const heroLead = text(body.heroLead);
  const photoUrl = text(body.photoUrl);
  const photoTagline = text(body.photoTagline);
  const aboutNote = text(body.aboutNote);
  const badgeValue = text(body.badgeValue);
  const badgeLabel = text(body.badgeLabel);
  const contactSubtitle = text(body.contactSubtitle);
  const contactEmail = text(body.contactEmail);

  // Nullable — kosong atau tidak dikirim berarti tanpa tautan panggilan.
  const contactCallUrl = text(body.contactCallUrl) || null;

  const errors = collectErrors({
    fullName: !fullName ? "Nama lengkap wajib diisi." : undefined,
    brand: !brand ? "Brand wajib diisi." : undefined,
    role: !role ? "Peran wajib diisi." : undefined,
    availabilityText: !availabilityText
      ? "Teks ketersediaan wajib diisi."
      : undefined,
    heroLead: !heroLead ? "Kalimat pembuka hero wajib diisi." : undefined,
    photoUrl: !photoUrl ? "URL foto wajib diisi." : undefined,
    photoTagline: !photoTagline ? "Tagline foto wajib diisi." : undefined,
    aboutNote: !aboutNote ? "Catatan singkat wajib diisi." : undefined,
    badgeValue: !badgeValue ? "Nilai badge wajib diisi." : undefined,
    badgeLabel: !badgeLabel ? "Label badge wajib diisi." : undefined,
    contactSubtitle: !contactSubtitle
      ? "Subjudul kontak wajib diisi."
      : undefined,
    contactEmail: !contactEmail ? "Email kontak wajib diisi." : undefined,
  });

  if (errors) {
    throw createError({ statusCode: 400, statusMessage: errors });
  }

  // Daftar diperiksa setelah kolom teks agar body yang kosong sama
  // sekali melaporkan seluruh kolom wajib, bukan hanya daftarnya.
  const rotatingWords = parseStringList(body.rotatingWords, "Kata berputar");
  const aboutParagraphs = parseStringList(body.aboutParagraphs, "Paragraf");

  const data = {
    fullName,
    brand,
    role,
    availabilityText,
    heroLead,
    rotatingWords,
    photoUrl,
    photoTagline,
    aboutNote,
    aboutParagraphs,
    badgeValue,
    badgeLabel,
    contactSubtitle,
    contactEmail,
    contactCallUrl,
  };

  const prisma = getPrismaClient();

  try {
    const saved = await prisma.profile.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
      select: {
        id: true,
        fullName: true,
        brand: true,
        role: true,
        availabilityText: true,
        heroLead: true,
        rotatingWords: true,
        photoUrl: true,
        photoTagline: true,
        aboutNote: true,
        aboutParagraphs: true,
        badgeValue: true,
        badgeLabel: true,
        contactSubtitle: true,
        contactEmail: true,
        contactCallUrl: true,
      },
    });

    return ok<ProfileAdmin>(saved);
  } catch (error) {
    throwPrismaError(error, {
      singular: "Profile",
      conflictMessage: "Profil tersebut sudah ada.",
    });
  }
});
