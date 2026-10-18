/**
 * Tipe untuk mekanisme upload & pemindahan gambar di lapisan server.
 *
 * Konvensi path yang dipakai seluruh aplikasi:
 * - File disimpan relatif terhadap folder `public/`, contoh `uploads/projects/abc.webp`
 *   (`relativePath`).
 * - Database menyimpan **URL root-relative** yang disajikan Nitro dari folder
 *   `public/`, contoh `/uploads/projects/abc.webp` (`publicUrl`).
 *
 * Keduanya sengaja dibedakan karena path file dan URL yang diakses browser
 * bukan hal yang sama — menyatukannya membuat prefix direktori ganda dan
 * membingungkan saat memindahkan aset antar environment.
 */

/** Opsi konfigurasi untuk `moveImage`. */
export interface MoveImageOptions {
  /**
   * Folder tujuan relatif terhadap `public/`, contoh `uploads/projects`.
   * Wajib eksplisit di setiap pemanggil agar tujuan tidak terselip di hardcode.
   */
  destination: string;
  /**
   * Opsional: nama file yang diinginkan (tanpa ekstensi). Akan disanitasi
   * terlebih dahulu. Bila tidak diisi, nama unik dibuat otomatis.
   */
  fileName?: string;
}

/** Hasil pemindahan gambar oleh `moveImage`. */
export interface MoveImageResult {
  /** Nama file final yang aman dan unik, contoh `a1b2c3d4.webp`. */
  fileName: string;
  /** Path file relatif terhadap `public/`, contoh `uploads/projects/a1b2c3d4.webp`. */
  relativePath: string;
  /** Nilai yang disimpan ke database dan dipakai `<img src>`, contoh `/uploads/projects/a1b2c3d4.webp`. */
  publicUrl: string;
}
