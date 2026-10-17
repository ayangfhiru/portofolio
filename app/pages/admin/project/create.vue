<script setup lang="ts">
/**
 * Halaman tambah project (mode Create).
 * Hanya merangkai heading dan `ProjectForm` — seluruh logika form,
 * validasi, dan pengiriman data tinggal di komponen form tersebut.
 */
import { ProjectForm } from "~/components/admin";

useHead({
  title: "Tambah Project — Admin",
});
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
          Tambah project baru
        </h1>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Isi data project berikut. Data tersimpan melalui
          <span class="font-medium text-slate-600">POST /api/projects</span>
          dan akan tampil pada bagian Work di halaman utama.
        </p>
      </div>

      <ProjectForm mode="create" />
    </main>
  </div>
</template>
