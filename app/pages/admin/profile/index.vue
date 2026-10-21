<script setup lang="ts">
/**
 * Halaman kelola profil.
 *
 * Profil adalah **singleton**: hanya ada satu baris (`id` selalu
 * `"singleton"`) yang menampung identitas, konfigurasi hero, About, dan
 * kontak sekaligus. Karena itu halaman ini TIDAK berbentuk tabel —
 * tidak ada baris untuk dipilih, dibuat, maupun dihapus — melainkan
 * berupa satu form yang seluruh penyimpanannya berjalan sebagai upsert
 * lewat `PUT /api/admin/profile`.
 *
 * Data dimuat sebelum render sehingga SSR sudah menampilkan isi profil
 * sungguhan, bukan kerangka loading.
 */
import { AlertCircle, RefreshCw } from "@lucide/vue";
import { ref } from "vue";
import { AdminTopbar, AppToast, ProfileForm } from "~/components/admin";
import { useToast } from "~/composables";
import type { ApiResponse, ProfileAdmin } from "~/types";
import { extractApiError, ADMIN_NAV_ITEMS } from "~/utils";

useHead({ title: "Kelola Profil — Admin" });

const toast = useToast();

const profile = ref<ProfileAdmin | null>(null);
const loading = ref(true);
const loadError = ref<string | null>(null);

/** Ambil profil tunggal dari API. `null` berarti belum pernah dibuat. */
const loadProfile = async (): Promise<void> => {
  loading.value = true;
  loadError.value = null;

  try {
    const response =
      await $fetch<ApiResponse<ProfileAdmin | null>>("/api/admin/profile");

    if (!response.success) {
      throw new Error(
        response.error ?? "Server tidak mengembalikan data profil.",
      );
    }

    // `null` bukan kegagalan — hanya menandakan barisnya belum dibuat.
    profile.value = response.data;
  } catch (error) {
    profile.value = null;
    loadError.value = extractApiError(
      error,
      "Gagal memuat data profil.",
    ).message;
  } finally {
    loading.value = false;
  }
};

await loadProfile();

/** Sinkronkan profil lokal setelah server mengonfirmasi penyimpanan. */
const onSaved = (saved: ProfileAdmin): void => {
  profile.value = saved;
  toast.success("Profil disimpan", "Perubahan tersimpan pada baris tunggal.");
};
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <AdminTopbar
      :nav-items="ADMIN_NAV_ITEMS"
      active-key="profile"
    />

    <main class="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
      <!-- Kepala halaman -->
      <div class="py-9">
        <div
          class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent"
        >
          Admin · Profil
        </div>
        <h1
          class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.85rem)] font-extrabold leading-[1.04] tracking-tight"
        >
          Profil tunggal
          <span class="font-bold text-admin-muted-2">/ view form</span>
        </h1>
        <p class="mt-3 max-w-[74ch] text-[.985rem] text-admin-muted">
          Satu baris data yang menampung identitas, konfigurasi
          <b class="text-admin-ink">Hero</b>,
          <b class="text-admin-ink">About</b>, dan
          <b class="text-admin-ink">Contact</b> di halaman utama. Karena hanya
          ada satu baris, tersimpan lewat
          <code
            class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2"
            >PUT /api/admin/profile</code
          >
          sebagai upsert — tanpa tombol tambah maupun hapus.
        </p>
      </div>

      <!-- Error memuat -->
      <div
        v-if="loadError"
        role="alert"
        class="mb-6 flex flex-wrap items-center gap-3 rounded-[16px] border border-[#f2c9c5] bg-admin-accent-soft px-5 py-4 text-sm font-semibold text-admin-accent-dark"
      >
        <AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{{ loadError }}</span>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 font-bold underline underline-offset-[3px]"
          @click="loadProfile"
        >
          <RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />
          Coba lagi
        </button>
      </div>

      <!-- Form profil -->
      <section
        class="overflow-hidden rounded-[20px] border border-admin-line bg-admin-card shadow-[0_1px_2px_rgba(16,24,40,.05)]"
      >
        <div
          v-if="loading"
          role="status"
          class="px-5 py-10 text-center text-sm font-semibold text-admin-muted sm:px-[30px]"
        >
          Memuat data profil…
        </div>

        <ProfileForm
          v-else
          :key="profile?.id ?? 'empty'"
          :initial-profile="profile"
          @saved="onSaved"
        />
      </section>

      <!-- Catatan penyimpanan -->
      <p class="mt-4 text-[.83rem] leading-relaxed text-admin-muted">
        Penyimpanan menulis ulang seluruh field di atas pada baris tunggal
        tersebut. Daftar yang kosong (mis. tanpa kata berputar) diperbolehkan
        dan sudah ditangani oleh bagian halaman yang bersangkutan.
      </p>
    </main>

    <AppToast />
  </div>
</template>
