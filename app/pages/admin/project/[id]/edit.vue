<script setup lang="ts">
/**
 * Halaman ubah project (mode Update).
 *
 * Data dimuat dari `GET /api/projects/:id` hanya untuk mengisi form edit
 * (bukan halaman read/detail). Bila project tidak ditemukan, server
 * mengembalikan `404` dan halaman ini menampilkan pesannya.
 *
 * Halaman tidak melakukan navigasi otomatis setelah simpan — pesan
 * sukses ditampilkan langsung oleh `ProjectForm`.
 */
import { LoaderCircle } from "@lucide/vue";
import { ProjectForm } from "~/components/admin";
import { extractApiError } from "~/utils/post-project";
import type { ApiResponse } from "~/types/api";
import type { ProjectItem } from "~/types/project";

useHead({
  title: "Ubah Project — Admin",
});

const route = useRoute();

const projectId = computed(() => String(route.params.id ?? ""));

type LoadState = "loading" | "ready" | "error";
interface LoadError {
  statusCode: number | null;
  message: string;
}

const loadState = ref<LoadState>("loading");
const loadError = ref<LoadError | null>(null);
const project = ref<ProjectItem | null>(null);

/** Apakah kegagalan memuat disebabkan oleh project yang tidak ada? */
const isNotFound = computed(
  () => loadError.value?.statusCode === 404,
);

/**
 * Muat satu project untuk mengisi form.
 * Menggunakan `$fetch` biasa (bukan `useFetch`) agar status error
 * — khususnya `404` — dapat dibedakan dan ditampilkan dengan jelas.
 */
const loadProject = async (): Promise<void> => {
  loadState.value = "loading";
  loadError.value = null;

  try {
    const response = await $fetch<ApiResponse<ProjectItem>>(
      `/api/projects/${encodeURIComponent(projectId.value)}`,
    );

    if (!response.success || !response.data) {
      loadState.value = "error";
      loadError.value = {
        statusCode: null,
        message: response.error ?? "Data project tidak tersedia.",
      };
      return;
    }

    project.value = response.data;
    loadState.value = "ready";
  } catch (error) {
    loadState.value = "error";
    loadError.value = extractApiError(error, "Gagal memuat data project.");
  }
};

// Dijalankan saat setup sehingga hasilnya sudah tersedia pada render SSR.
await loadProject();
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <main class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <!-- Heading -->
      <div class="mb-6 sm:mb-8">
        <p class="mb-2 text-sm font-medium text-[#D71920]">Admin · Project</p>

        <h1
          class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
        >
          Ubah project
        </h1>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Perbarui data project melalui
          <span class="font-medium text-slate-600">PATCH /api/projects/:id</span>.
          Hanya field yang berubah yang dikirim ke server.
        </p>
      </div>

      <!-- Sedang memuat -->
      <div
        v-if="loadState === 'loading'"
        class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 shadow-sm sm:px-8"
      >
        <LoaderCircle class="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
        <span>Memuat data project…</span>
      </div>

      <!-- Gagal memuat (termasuk 404) -->
      <div
        v-else-if="loadState === 'error'"
        role="alert"
        class="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 shadow-sm sm:px-8"
      >
        <p class="font-medium">
          {{ isNotFound ? "Project tidak ditemukan." : "Gagal memuat project." }}
        </p>
        <p class="mt-1 text-red-600">{{ loadError?.message }}</p>

        <NuxtLink
          to="/admin/project/create"
          class="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-red-600 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:border-red-700 hover:bg-red-700 active:bg-red-800"
        >
          Buat project baru
        </NuxtLink>
      </div>

      <!-- Form siap diisi -->
      <ProjectForm
        v-else-if="project"
        mode="update"
        :initial-project="project"
      />
    </main>
  </div>
</template>
