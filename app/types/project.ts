/**
 * Tipe project portfolio.
 *
 * Catatan: di database kategori disimpan sebagai enum Prisma
 * (`WEB` | `MOBILE` | `OSS`), tetapi endpoint API menormalkannya
 * menjadi huruf kecil (`web` | `mobile` | `oss`) agar ringkas
 * dan konsisten di frontend.
 */

/** Tag yang menempel pada sebuah project. */
export interface ProjectTag {
  name: string;
}

/** Project portfolio yang disajikan oleh `/api/projects`. */
export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  description:  string;
  category: ProjectCategory;
  year: number;
  imageUrl: string;
  href: string | null;
  featured: boolean;
  tags: ProjectTag[];
  /** Waktu pembuatan (ISO 8601) — dipakai kolom "Diperbarui" pada tabel admin. */
  createdAt: string;
  updatedAt: string;
}

export type ProjectCategory = "web" | "mobile" | "oss";

/** Filter yang tersedia pada bagian Work. */
export interface ProjectFilter {
  value: ProjectCategory | "all";
  label: string;
}

/**
 * Payload untuk membuat project baru lewat `POST /api/projects`.
 * `imageUrl` berupa URL eksternal (mis. Unsplash) atau path hasil upload.
 */
export interface ProjectPayload {
  slug: string;
  title: string;
  description: string;
  category: ProjectCategory;
  year: number;
  imageUrl: string;
  href?: string | null;
  featured?: boolean;
  tags: string[];
}

/**
 * Payload untuk mengubah project lewat `PATCH /api/projects/:id`.
 *
 * Sifatnya **sebagian** (`Partial`): hanya key yang benar-benar dikirim
 * yang akan ditulis server. Key yang tidak ada dilewatkan begitu saja,
 * sedangkan `href: null` berarti mengosongkan kolom secara sengaja.
 */
export interface ProjectUpdatePayload {
  title?: string;
  slug?: string;
  description?: string;
  category?: ProjectCategory;
  year?: number;
  imageUrl?: string;
  href?: string | null;
  featured?: boolean;
  tags?: string[];
}

/**
 * Bentuk state form pada `components/admin/ProjectForm.vue`.
 * Dipakai bersama oleh mode Create dan Update.
 *
 * Catatan: `year` disimpan sebagai `string` karena `BaseInput`
 * hanya menerima model `string | File | null`; konversi ke `number`
 * dilakukan saat validasi dan saat membangun payload.
 */
export interface ProjectFormState {
  title: string;
  slug: string;
  description: string;
  category: ProjectCategory | "";
  year: string;
  imageUrl: string;
  href: string;
  featured: boolean;
  /** Daftar tag sebagai string tunggal dipisah koma (agar mudah diedit). */
  tags: string;
}
