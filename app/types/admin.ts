/**
 * Tipe bersama untuk komponen panel admin.
 *
 * Disimpan terpisah dari komponen karena dipakai lintas modul:
 * komponen yang menerimanya maupun halaman yang memakainya.
 */
import type { Component } from "vue";

/** Ikon lucide yang dipetakan langsung dari konfigurasi navigasi. */
export type NavIcon = Component;

/** Identitas pengirim yang tampil di topbar maupun laci mobile. */
export interface AdminUser {
  name: string;
  role: string;
  avatar?: string;
}

/**
 * Tautan tunggal pada navigasi admin.
 *
 * Bentuk ini selalu memiliki tujuan sehingga aman dirender sebagai
 * `NuxtLink` — dipakai pada isi grup dropdown, hasil pencarian, dan
 * menu pengguna.
 */
export interface AdminNavLink {
  key: string;
  label: string;
  to: string;
  isBlank?: boolean;
  icon?: NavIcon;
  /** Keterangan singkat tampil di bawah label. */
  description?: string;
}

/**
 * Item menu topbar admin.
 *
 * Tanpa `children` ia dirender sebagai tautan langsung; dengan `children`
 * ia menjadi dropdown pada desktop dan akordeon pada laci mobile.
 */
export interface AdminNavItem {
  key: string;
  label: string;
  /** Rute tujuan. Bila kosong, item tampil sebagai label nonaktif. */
  to?: string;
  icon?: NavIcon;
  description?: string;
  children?: AdminNavLink[];
}

/** Satu kartu pada deretan statistik. */
export interface StatItem {
  key: string;
  label: string;
  value: string | number;
  hint?: string;
}

/** Definisi kolom pada tabel data admin. */
export interface DataTableColumn {
  /** Nama field pada row, atau kunci khusus bila memakai slot `cell-<key>`. */
  key: string;
  label: string;
  /** Tampilkan panah urutan dan izinkan pengurutan pada kolom ini. */
  sortable?: boolean;
  align?: "left" | "right";
  /** Lebar kolom (CSS), mis. `"52px"` atau `"18%"`. */
  width?: string;
  /** Sembunyikan label di tampilan kartu (layar kecil). */
  hideLabel?: boolean;
}

/** Satu pilihan pada dropdown filter toolbar. */
export interface ToolbarFilterOption {
  label: string;
  value: string;
}

/** Definisi satu dropdown filter pada toolbar tabel. */
export interface ToolbarFilter {
  key: string;
  label: string;
  value: string;
  options: ToolbarFilterOption[];
}
