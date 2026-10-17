/**
 * Grup tech stack (Frontend, Backend, ...).
 * Disajikan oleh `/api/stack`.
 *
 * `items` berupa daftar nama teknologi — sederhana karena
 * frontend hanya perlu menampilkan nama tanpa field lain.
 */
export interface StackGroup {
  title: string;
  items: string[];
}
