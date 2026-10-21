<script setup lang="ts">
/**
 * Cangkang halaman autentikasi (login & register).
 *
 * Kepala halaman, kartu form, banner informasi, dan tautan pengalihan
 * antar halaman tamu dibungkus di sini supaya `login.vue` dan
 * `register.vue` cukup berisi judul serta form masing-masing —
 * tanpa menggandakan markup sekaligus menjamin tampilannya identik.
 *
 * Seluruh styling memakai token tema admin (`bg-admin-*`) persis
 * seperti halaman panel, karena halaman ini adalah pintu masuk panel.
 */
import { CheckCircle2 } from "@lucide/vue";
import AdminBrand from "~/components/admin/topbar/AdminBrand.vue";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  /** Pesan informasi di atas form, mis. hasil pendaftaran. */
  notice?: string;
}

const props = withDefaults(defineProps<Props>(), {
  notice: "",
});
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <header class="border-b border-admin-line bg-white/85 backdrop-blur-xl">
      <div
        class="mx-auto flex h-19 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8"
      >
        <AdminBrand to="/" />
      </div>
    </header>

    <main class="mx-auto w-full max-w-[560px] px-4 pb-16 pt-10 sm:px-6 sm:pt-14">
      <div
        class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent"
      >
        {{ props.eyebrow }}
      </div>
      <h1
        class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.6rem)] font-extrabold leading-[1.04] tracking-tight"
      >
        {{ props.title }}
      </h1>
      <p class="mt-3 text-[.985rem] text-admin-muted">
        {{ props.description }}
      </p>

      <div
        class="mt-7 rounded-2xl border border-admin-line bg-admin-card p-5 shadow-[0_18px_44px_-18px_rgba(15,23,40,.28)] sm:p-7"
      >
        <div
          v-if="props.notice"
          role="status"
          class="mb-6 flex items-start gap-3 rounded-xl border border-[#bfdfd1] bg-admin-ok-soft px-4 py-3 text-sm text-admin-ok"
        >
          <CheckCircle2 class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{{ props.notice }}</p>
        </div>

        <slot />
      </div>

      <div class="mt-6 text-center text-sm text-admin-muted">
        <slot name="footer" />
      </div>
    </main>
  </div>
</template>
