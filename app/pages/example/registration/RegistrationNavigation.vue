<script setup lang="ts">
import { ArrowLeft, ArrowRight, LoaderCircle, Send } from "lucide-vue-next";

interface Props {
  isFirstStep?: boolean;
  isLastStep?: boolean;
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  isFirstStep: false,
  isLastStep: false,
  loading: false,
});

const emit = defineEmits<{
  previous: [];
  next: [];
  submit: [];
}>();
</script>

<template>
  <div class="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
    <div class="flex items-center justify-between gap-3">
      <!-- Tombol Sebelumnya -->
      <button
        type="button"
        class="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-5"
        :disabled="isFirstStep || loading"
        @click="emit('previous')"
      >
        <ArrowLeft class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span class="whitespace-nowrap">Sebelumnya</span>
      </button>

      <!-- Tombol Lanjut -->
      <button
        v-if="!isLastStep"
        type="button"
        class="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:border-red-700 hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-5"
        :disabled="loading"
        @click="emit('next')"
      >
        <span class="whitespace-nowrap">Lanjut</span>
        <ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
      </button>

      <!-- Tombol Kirim -->
      <button
        v-else
        type="button"
        class="inline-flex min-h-11 min-w-0 flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg border border-red-600 bg-red-600 px-2.5 sm:px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:border-red-700 hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="loading"
        @click="emit('submit')"
      >
        <!-- Ikon kirim -->
        <Send v-if="!loading" class="h-4 w-4 shrink-0" aria-hidden="true" />

        <!-- Ikon loading -->
        <LoaderCircle
          v-else
          class="h-4 w-4 shrink-0 animate-spin"
          aria-hidden="true"
        />

        <!-- Label mobile -->
        <span class="whitespace-nowrap sm:hidden">
          {{ loading ? "Mengirim..." : "Daftar" }}
        </span>

        <!-- Label desktop -->
        <span class="hidden whitespace-nowrap sm:inline">
          {{ loading ? "Mengirim..." : "Kirim Pendaftaran" }}
        </span>
      </button>
    </div>
  </div>
</template>
