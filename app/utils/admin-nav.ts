import {
  Boxes,
  Briefcase,
  ChartColumn,
  Contact,
  ExternalLink,
  FolderKanban,
  Layers,
  LayoutDashboard,
  ListChecks,
  MessageSquareQuote,
  Share2,
  UserRound,
  Wrench,
} from "@lucide/vue";
import type { AdminNavItem, AdminNavLink } from "~/types/admin";

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
 * Seluruh modul admin, dikelompokkan mengikuti alur kerja: ringkasan,
 * isi utama (project), master data yang menghidupi tiap bagian halaman
 * publik, lalu profil.
 *
 * Kunci yang dipakai di sini juga dikirim sebagai `active-key` oleh
 * tiap halaman, sehingga grup "Master Data" ikut tersorot ketika salah
 * satu anaknya sedang aktif.
 */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: "dashboard",
    label: "Beranda",
    to: "/admin",
    icon: LayoutDashboard,
    description: "Ringkasan modul dan pintasan kelola data",
  },
  {
    key: "project",
    label: "Project",
    to: "/admin/project",
    icon: FolderKanban,
    description: "Kelola daftar project portfolio",
  },
  {
    key: "master",
    label: "Master Data",
    children: [
      {
        key: "service",
        label: "Layanan",
        to: "/admin/service",
        icon: Wrench,
        description: "Daftar layanan yang ditawarkan",
      },
      {
        key: "stat",
        label: "Statistik",
        to: "/admin/stat",
        icon: ChartColumn,
        description: "Angka sorotan pada bagian hero",
      },
      {
        key: "stack-group",
        label: "Grup Stack",
        to: "/admin/stack-group",
        icon: Layers,
        description: "Kelompok teknologi seperti Frontend",
      },
      {
        key: "stack-item",
        label: "Item Stack",
        to: "/admin/stack-item",
        icon: Boxes,
        description: "Item teknologi di dalam tiap grup",
      },
      {
        key: "experience",
        label: "Pengalaman",
        to: "/admin/experience",
        icon: Briefcase,
        description: "Riwayat pengalaman kerja",
      },
      {
        key: "testimonial",
        label: "Testimoni",
        to: "/admin/testimonial",
        icon: MessageSquareQuote,
        description: "Kata kata dari klien",
      },
      {
        key: "fact",
        label: "Fakta",
        to: "/admin/fact",
        icon: ListChecks,
        description: "Fakta singkat pada bagian About",
      },
      {
        key: "contact-card",
        label: "Kartu Kontak",
        to: "/admin/contact-card",
        icon: Contact,
        description: "Kartu kontak dan tautan pesan",
      },
      {
        key: "social-link",
        label: "Tautan Sosial",
        to: "/admin/social-link",
        icon: Share2,
        description: "Tautan media sosial",
      },
    ],
  },
  {
    key: "profile",
    label: "Profil",
    to: "/admin/profile",
    icon: UserRound,
    description: "Identitas, hero, About, dan kontak situs",
  },
];

/** Menu pada dropdown pengguna di topbar. */
export const ADMIN_USER_LINKS: AdminNavLink[] = [
  {
    key: "profile",
    label: "Profil Saya",
    to: "/admin/profile",
    icon: UserRound,
    description: "Ubah identitas dan pengaturan situs",
  },
  {
    key: "site",
    label: "Lihat Situs",
    to: "/",
    icon: ExternalLink,
    description: "Buka halaman publik portfolio",
  },
];

/** Ubah pohon navigasi menjadi daftar datar berisi tautan saja. */
const flattenLinks = (items: AdminNavItem[]): AdminNavLink[] =>
  items.flatMap((item) => {
    if (item.children?.length) return flattenLinks(item.children);
    if (!item.to) return [];

    return [
      {
        key: item.key,
        label: item.label,
        to: item.to,
        icon: item.icon,
        description: item.description,
      },
    ];
  });

/**
 * Seluruh tautan modul dalam bentuk datar.
 *
 * Dipakai kotak pencarian topbar supaya modul mana pun bisa ditemukan
 * tanpa harus membuka grup dropdown lebih dulu.
 */
export const ADMIN_SEARCH_LINKS: AdminNavLink[] = flattenLinks(ADMIN_NAV_ITEMS);
