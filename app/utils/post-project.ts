import type { ApiResponse } from "~/types/api";
import type { ProjectItem, ProjectPayload } from "~/types/project";

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
