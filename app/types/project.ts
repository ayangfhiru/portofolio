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
