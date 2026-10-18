<script setup lang="ts">
import { LoaderCircle, Trash2 } from "@lucide/vue";
import ModalDialog from "./ModalDialog.vue";

/**
 * Dialog konfirmasi tindakan destruktif (mis. menghapus data).
 *
 * Membungkus `ModalDialog` dengan ukuran kecil dan ikon bahaya agar
 * berbagai halaman admin mendapat tampilan konfirmasi yang konsisten.
 * Kalimat penjelas dapat diberikan lewat `description`, atau ditulis
 * bebas (dengan tag penekanan) lewat slot `default`.
 */

interface Props {
  open: boolean;
  title: string;
  /** Kalimat penjelas sederhana — dilewati bila slot `default` terisi. */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Nonaktifkan tombol konfirmasi dan tampilkan indikator proses. */
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  description: "",
  confirmLabel: "Ya, hapus",
  cancelLabel: "Batal",
  loading: false,
});

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();
</script>

<template>
  <ModalDialog
    :open="props.open"
    size="sm"
    :hide-close="props.loading"
    :aria-label="props.title"
    @close="emit('close')"
  >
    <div class="pb-2 text-center">
      <div
        class="mx-auto mb-[18px] grid h-[58px] w-[58px] place-items-center rounded-2xl bg-admin-accent-soft text-admin-accent"
      >
        <Trash2 class="h-6 w-6" aria-hidden="true" />
      </div>

      <!-- Eksplisit: dialog di-Teleport ke <body>, di luar pembungkus `text-admin-ink`. -->
      <h3 class="font-display text-[1.25rem] tracking-tight text-admin-ink">
        {{ props.title }}
      </h3>

      <!-- Slot menimpa `description`; bila keduanya kosong, paragraf tidak dirender -->
      <p
        v-if="props.description || $slots.default"
        class="mx-auto mt-2.5 max-w-[46ch] text-[.915rem] text-admin-muted"
      >
        <slot>{{ props.description }}</slot>
      </p>
    </div>

    <template #footer>
      <div class="flex w-full flex-col justify-center gap-2.5 sm:flex-row">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-admin-line-2 bg-white px-[18px] py-[11px] text-sm font-bold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          :disabled="props.loading"
          @click="emit('close')"
        >
          {{ props.cancelLabel }}
        </button>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] bg-admin-accent px-[18px] py-[11px] text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          :disabled="props.loading"
          :aria-busy="props.loading"
          @click="emit('confirm')"
        >
          <LoaderCircle
            v-if="props.loading"
            class="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
          <Trash2 v-else class="h-4 w-4" aria-hidden="true" />
          {{ props.loading ? "Menghapus…" : props.confirmLabel }}
        </button>
      </div>
    </template>
  </ModalDialog>
</template>
