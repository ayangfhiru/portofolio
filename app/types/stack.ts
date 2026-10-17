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

/**
 * Satu baris `StackGroup` pada tabel admin.
 *
 * Berbeda dengan tipe publik, tabel admin tidak memuat `items` penuh —
 * cukup `itemCount` hasil `_count` agar daftar tetap ringan.
 */
export interface StackGroupAdmin {
  id: string;
  title: string;
  /** Urutan tampil — angka lebih kecil tampil lebih awal. */
  order: number;
  /** Jumlah `StackItem` di dalam grup ini. */
  itemCount: number;
}

/** Payload pembuatan grup lewat `POST /api/admin/stack-groups`. */
export interface StackGroupCreateInput {
  title: string;
  order?: number;
}

/** Payload perubahan grup lewat `PATCH /api/admin/stack-groups/:id`. */
export interface StackGroupUpdateInput {
  title?: string;
  order?: number;
}

/**
 * State form `StackGroupForm.vue`.
 *
 * `order` disimpan sebagai `string` karena `BaseInput` hanya menerima
 * model `string | File | null`; konversi ke `number` dilakukan saat
 * validasi dan saat membangun payload.
 */
export interface StackGroupFormState {
  title: string;
  order: string;
}

/**
 * Satu baris `StackItem` pada tabel admin.
 *
 * Berbeda dengan tipe publik (yang hanya menyimpan nama), tabel admin
 * memuat `groupId` untuk mengikat baris ke induknya serta `groupTitle`
 * agar relasi dapat ditampilkan tanpa memuat ulang `StackGroup`.
 */
export interface StackItemAdmin {
  id: string;
  name: string;
  /** Urutan tampil — angka lebih kecil tampil lebih awal. */
  order: number;
  /** Foreign key ke `StackGroup.id`. */
  groupId: string;
  /** Judul grup — label relasi yang tampil di tabel dan form. */
  groupTitle: string;
}

/** Payload pembuatan item lewat `POST /api/admin/stack-items`. */
export interface StackItemCreateInput {
  name: string;
  groupId: string;
  order?: number;
}

/** Payload perubahan item lewat `PATCH /api/admin/stack-items/:id`. */
export interface StackItemUpdateInput {
  name?: string;
  groupId?: string;
  order?: number;
}

/**
 * State form `StackItemForm.vue`.
 *
 * `groupId` disimpan sebagai `string` sesuai tipe identifier `StackGroup`,
 * dan `order` sebagai `string` karena `BaseInput` hanya menerima model
 * `string | File | null`; konversi ke `number` dilakukan saat validasi.
 */
export interface StackItemFormState {
  name: string;
  groupId: string;
  order: string;
}
