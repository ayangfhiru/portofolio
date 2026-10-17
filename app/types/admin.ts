/**
 * Tipe bersama untuk komponen panel admin.
 *
 * Disimpan terpisah dari komponen karena dipakai lintas modul:
 * komponen yang menerimanya maupun halaman yang memakainya.
 */

/** Item menu pada topbar admin. */
export interface TopNavItem {
  key: string;
  label: string;
  /** Rute tujuan. Bila kosong, item tampil sebagai label nonaktif. */
  to?: string;
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
