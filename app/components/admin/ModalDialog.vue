<script setup lang="ts">
import { X } from "@lucide/vue";
import { onMounted, onUnmounted, watch } from "vue";

/**
 * Modal dialog generik: kepala, badan, dan kaki.
 *
 * Struktur & gaya mengikuti desain referensi panel admin. Konten badan
 * dan kaki disediakan lewat slot sehingga komponen ini dapat dipakai
 * untuk form, konfirmasi, maupun dialog lain.
 *
 * Menutup diri saat mengklik latar belakang, menekan Escape, atau
 * memancarkan event `close` dari dalam slot.
 */

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  /** Teks kecil di atas judul, mis. "Admin · Project". */
  eyebrow?: string;
  /** `sm` untuk dialog konfirmasi singkat. */
  size?: "default" | "sm";
  /** Sembunyikan tombol tutup di pojok kanan atas. */
  hideClose?: boolean;
  /**
   * Nama aksesibel untuk pembaca layar, bila judul terlihat tidak berasal
   * dari `title` (mis. dialog konfirmasi menampilkan judulnya di badan).
   * `role="dialog"` tidak mengambil nama dari isi, jadi tanpa nilai ini
   * dialog akan tanpa nama.
   */
  ariaLabel?: string;
  /**
   * Class pada wadah badan. Disetel `p-0` bila konten (mis. form)
   * sudah mengatur padding dan garis tepinya sendiri.
   */
  bodyClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  eyebrow: "",
  size: "default",
  hideClose: false,
  ariaLabel: "",
  bodyClass: "px-5 py-6 sm:px-[30px]",
});

const emit = defineEmits<{ close: [] }>();

/** Kunci Escape hanya aktif saat dialog terbuka. */
const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && props.open) emit("close");
};

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));

// Kunci gulir halaman selama dialog terbuka (hanya di sisi klien).
watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
  { immediate: true },
);
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.open"
        class="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[rgba(15,23,40,.42)] p-5 backdrop-blur-md sm:p-11"
        role="dialog"
        aria-modal="true"
        :aria-label="props.ariaLabel || props.title || undefined"
        @mousedown.self="emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="-translate-y-5 scale-[.975] opacity-0"
          leave-to-class="-translate-y-5 scale-[.975] opacity-0"
          appear
        >
          <div
            class="my-auto w-full overflow-hidden rounded-[20px] border border-admin-line bg-white shadow-[0_28px_60px_-22px_rgba(16,24,40,.28)]"
            :class="props.size === 'sm' ? 'max-w-[430px]' : 'max-w-[720px]'"
          >
            <!-- Kepala -->
            <div
              v-if="props.eyebrow || props.title || props.description || $slots.description || !props.hideClose"
              class="flex items-start gap-4 border-b border-admin-line px-5 pb-5 pt-6 sm:px-[30px]"
            >
              <div class="min-w-0">
                <div v-if="props.eyebrow" class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
                  {{ props.eyebrow }}
                </div>
                <!-- Warna ditulis eksplisit: modal di-Teleport ke <body> sehingga
                     tidak mewarisi `text-admin-ink` dari pembungkus halaman. -->
                <h2 v-if="props.title" class="mt-2 font-display text-[1.55rem] font-extrabold leading-tight tracking-tight text-admin-ink">
                  {{ props.title }}
                </h2>
                <p
                  v-if="props.description || $slots.description"
                  class="mt-2 max-w-[56ch] text-sm text-admin-muted"
                >
                  <slot name="description">{{ props.description }}</slot>
                </p>
              </div>

              <button
                v-if="!props.hideClose"
                type="button"
                aria-label="Tutup"
                class="ml-auto grid h-[37px] w-[37px] flex-none place-items-center rounded-[11px] border border-admin-line bg-white text-admin-muted transition hover:rotate-90 hover:border-admin-accent hover:bg-admin-accent hover:text-white"
                @click="emit('close')"
              >
                <X class="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <!-- Badan -->
            <div :class="props.bodyClass">
              <slot />
            </div>

            <!-- Kaki -->
            <div
              v-if="$slots.footer"
              class="flex flex-wrap justify-end gap-2.5 rounded-b-[20px] border-t border-admin-line bg-admin-head px-5 pb-6 pt-5 sm:px-[30px]"
            >
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
