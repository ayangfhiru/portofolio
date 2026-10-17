import { defineEventHandler } from "h3";
import { ok } from "../../../utils/response";
import type { ProfileAdmin } from "../../../../app/types/profile";

/**
 * GET /api/admin/profile
 *
 * Membaca profil untuk halaman kelola.
 *
 * Berbeda dengan modul lain, profil adalah singleton — hanya satu baris
 * dan tidak pernah berupa daftar. Karena itu tidak ada `withFallback`:
 * bila barisnya belum pernah dibuat, endpoint ini mengembalikan `null`
 * sehingga halaman kelola menampilkan form kosong (bukan data cadangan
 * palsu yang kelak bisa disimpan pengguna sebagai data nyata).
 *
 * Kolom dipilih secara eksplisit agar kontrak respons sama persis
 * dengan `ProfileAdmin` (tanpa timestamp penyimpanan).
 */
export default defineEventHandler(async () => {
  const prisma = getPrismaClient();

  const profile = await prisma.profile.findUnique({
    where: { id: "singleton" },
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

  return ok<ProfileAdmin | null>(profile);
});
