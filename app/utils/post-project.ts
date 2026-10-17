import type { ApiResponse } from "~/types/api";
import type {
  ProjectItem,
  ProjectPayload,
  ProjectUpdatePayload,
} from "~/types/project";

/**
 * Util pemanggilan API project di sisi client.
 *
 * `postProject` mendukung dua mode:
 * 1. Tanpa file   — mengirim JSON biasa dengan `imageUrl` eksternal.
 * 2. Dengan file  — mengirim `multipart/form-data` sehingga gambar
 *    ikut di-upload ke server (lihat `server/utils/upload.ts`).
 *
 * Contoh pakai dengan file:
 *   await postProject(
 *     { title: "Baru", description: "...", category: "web", year: 2026, imageUrl: "" },
 *     document.querySelector<HTMLInputElement>("#image")?.files?.[0],
 *   );
 */
export const postProject = async (
  payload: ProjectPayload,
  imageFile?: File | null,
): Promise<ApiResponse<ProjectItem>> => {
  // --- Mode upload file (multipart) -----------------------------------
  if (imageFile) {
    const body = new FormData();
    body.set("title", payload.title);
    body.set("description", payload.description);
    body.set("category", payload.category);
    body.set("year", String(payload.year));
    body.set("slug", payload.slug ?? "");
    body.set("href", payload.href ?? "");
    body.set("featured", String(payload.featured ?? false));
    // Tags dikirim sebagai JSON string agar aman lewat multipart.
    body.set("tags", JSON.stringify(payload.tags ?? []));
    body.set("image", imageFile);

    // $fetch otomatis mengirim FormData sebagai multipart.
    return await $fetch<ApiResponse<ProjectItem>>("/api/projects", {
      method: "POST",
      body,
    });
  }

  // --- Mode URL eksternal (JSON) --------------------------------------
  return await $fetch<ApiResponse<ProjectItem>>("/api/projects", {
    method: "POST",
    body: payload,
  });
};

/**
 * Helper untuk membangun payload project dari form sederhana.
 * Berguna bila pemanggil ingin merapikan nilai sebelum dikirim.
 */
export const buildProjectPayload = (
  input: Omit<ProjectPayload, "tags"> & { tags?: string[] },
): ProjectPayload => ({
  ...input,
  tags: input.tags ?? [],
});

/**
 * Mengubah sebagian field project lewat `PATCH /api/projects/:id`.
 *
 * Hanya key yang ada di `payload` yang dikirim — server memang menulis
 * semantik yang sama (key tidak dikirim = nilai lama dipertahankan).
 * Bila `href` di-set `null`, ia sengaja dikirim sebagai `null` (JSON)
 * atau string kosong (multipart) agar server mengosongkan kolomnya.
 *
 * Mode upload file mengirim `multipart/form-data`, mode lain JSON biasa.
 */
export const patchProject = async (
  id: string,
  payload: ProjectUpdatePayload,
  imageFile?: File | null,
): Promise<ApiResponse<ProjectItem>> => {
  const url = `/api/projects/${encodeURIComponent(id)}`;

  // --- Mode upload file (multipart) -----------------------------------
  if (imageFile) {
    const body = new FormData();

    if (payload.title !== undefined) body.set("title", payload.title);
    if (payload.slug !== undefined) body.set("slug", payload.slug);
    if (payload.description !== undefined)
      body.set("description", payload.description);
    if (payload.category !== undefined) body.set("category", payload.category);
    if (payload.year !== undefined) body.set("year", String(payload.year));
    if (payload.imageUrl !== undefined) body.set("imageUrl", payload.imageUrl);
    // null harus tetap terkirim agar server tahu ini "dikosongkan sengaja".
    if (payload.href !== undefined)
      body.set("href", payload.href === null ? "" : payload.href);
    if (payload.featured !== undefined)
      body.set("featured", String(payload.featured));
    if (payload.tags !== undefined)
      body.set("tags", JSON.stringify(payload.tags));

    body.set("image", imageFile);

    return await $fetch<ApiResponse<ProjectItem>>(url, {
      method: "PATCH",
      body,
    });
  }

  // --- Mode JSON biasa -------------------------------------------------
  return await $fetch<ApiResponse<ProjectItem>>(url, {
    method: "PATCH",
    body: payload,
  });
};

/**
 * Hapus satu project lewat `DELETE /api/projects/:id`.
 * Mengembalikan data ringkas project yang baru dihapus.
 */
export const deleteProject = async (
  id: string,
): Promise<ApiResponse<{ id: string; title: string }>> =>
  await $fetch<ApiResponse<{ id: string; title: string }>>(
    `/api/projects/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

/**
 * Hapus beberapa project sekaligus (aksi "Hapus Terpilih").
 *
 * Memanggil `DELETE /api/projects/:id` untuk tiap baris, lalu merangkum
 * hasilnya. Keberhasilan sebagian tetap dilaporkan apa adanya sehingga
 * pengguna tahu baris mana yang gagal.
 */
export const deleteProjects = async (
  ids: string[],
): Promise<{ succeeded: string[]; failed: string[] }> => {
  const results = await Promise.allSettled(
    ids.map((id) => deleteProject(id)),
  );

  const succeeded: string[] = [];
  const failed: string[] = [];

  for (const [index, result] of results.entries()) {
    const id = ids[index];
    if (!id) continue;

    if (result.status === "fulfilled" && result.value.success) {
      succeeded.push(id);
    } else {
      failed.push(id);
    }
  }

  return { succeeded, failed };
};

/**
 * Menarik pesan yang layak ditampilkan dari error hasil `$fetch`.
 *
 * Error bawaan Nitro berbentuk `{ statusCode, statusMessage, message }`.
 * Bila tidak terbaca (mis. jaringan putus), kembalikan pesan generik
 * sehingga caller tidak perlu menangani bentuk error yang beragam.
 */
export const extractApiError = (
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
): { statusCode: number | null; message: string } => {
  if (typeof error === "object" && error !== null) {
    const source = error as {
      statusCode?: unknown;
      statusMessage?: unknown;
      data?: { statusMessage?: unknown };
      message?: unknown;
    };

    const statusCode =
      typeof source.statusCode === "number" ? source.statusCode : null;

    // Urutan prioritas: pesan bawaan Nitro → pesan dari data → message.
    const raw =
      source.statusMessage ??
      source.data?.statusMessage ??
      (typeof source.message === "string" &&
      !/^fetch failed|network error/i.test(source.message)
        ? source.message
        : undefined);

    if (typeof raw === "string" && raw.trim()) {
      return { statusCode, message: raw.trim() };
    }

    return { statusCode, message: fallback };
  }

  return { statusCode: null, message: fallback };
};
