import type { TopNavItem } from "~/types/admin";

/**
 * Konfigurasi navigasi panel admin.
 *
 * Disimpan terpisah dari halaman karena dipakai oleh seluruh halaman
 * admin — mengubah daftar modul cukup dilakukan di satu tempat sehingga
 * tidak ada URL yang tertinggal atau menyimpang antar halaman.
 */

/** Nama pengguna yang tampil di pojok kanan atas topbar. */
export const ADMIN_USER = {
  name: "Raka Devano",
  role: "Super Admin",
};

/**
 * Seluruh modul admin.
 *
 * Urutan mengikuti alur kerja: ringkasan, isi utama (project), lalu
 * master data yang menghidupi tiap bagian halaman publik.
 */
export const ADMIN_NAV_ITEMS: TopNavItem[] = [
  { key: "dashboard", label: "Dashboard", to: "/admin" },
  { key: "project", label: "Project", to: "/admin/project" },
  { key: "service", label: "Layanan", to: "/admin/service" },
  { key: "stat", label: "Statistik", to: "/admin/stat" },
  { key: "stack-group", label: "Grup Stack", to: "/admin/stack-group" },
  { key: "stack-item", label: "Item Stack", to: "/admin/stack-item" },
  { key: "experience", label: "Pengalaman", to: "/admin/experience" },
  { key: "testimonial", label: "Testimoni", to: "/admin/testimonial" },
  { key: "fact", label: "Fakta", to: "/admin/fact" },
  { key: "contact-card", label: "Kartu Kontak", to: "/admin/contact-card" },
  { key: "social-link", label: "Tautan Sosial", to: "/admin/social-link" },
  { key: "profile", label: "Profil", to: "/admin/profile" },
];
