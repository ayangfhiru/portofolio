<script setup lang="ts">
import { GraduationCap } from "lucide-vue-next";

defineProps<{
  batch: string;
}>();
</script>

<template>
  <header class="">
    <div
      class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
    >
      <!-- Logo kiri -->
      <NuxtLink to="/" aria-label="Beranda" class="shrink-0">
        <img
          src="/images/logo.png"
          alt="Lembimjar Neutron Yogyakarta"
          class="h-auto w-36 object-contain object-left sm:w-44 lg:w-52"
        />
      </NuxtLink>

      <!-- Informasi kanan -->
      <div class="flex min-w-0 flex-col items-end gap-1.5">
        <div
          class="inline-flex max-w-full items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-medium text-[#D71920] sm:px-4 sm:py-2 sm:text-sm"
        >
          <GraduationCap class="h-4 w-4 shrink-0" />
          <span class="truncate">{{ batch }}</span>
        </div>
      </div>
    </div>
  </header>
</template>
