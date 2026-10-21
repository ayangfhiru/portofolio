<script setup lang="ts">
/**
 * Halaman masuk ke panel admin.
 *
 * Melindungi seluruh rute `/admin`. Parameter `redirect` (diisi oleh
 * middleware `auth.global.ts`) mengembalikan pengguna ke halaman yang
 * semula diminta sesudah berhasil masuk.
 */
import { computed } from "vue";
import { AuthCard, LoginForm } from "~/components/auth";

useHead({ title: "Masuk — Admin" });

const route = useRoute();

/** Tampil bila pendaftaran sukses tetapi tidak menghasilkan sesi aktif. */
const notice = computed(() =>
  route.query.registered === "1"
    ? "Akun berhasil dibuat. Silakan masuk dengan email dan password Anda."
    : "",
);
</script>

<template>
  <AuthCard
    eyebrow="Admin · Masuk"
    title="Masuk ke panel"
    description="Kelola seluruh isi portfolio dari satu tempat. Gunakan akun yang terdaftar pada sistem autentikasi aplikasi."
    :notice="notice"
  >
    <LoginForm />

    <template #footer>
      Belum punya akun?
      <NuxtLink
        to="/register"
        class="font-semibold text-admin-accent transition-colors hover:text-admin-accent-dark"
      >
        Daftar akun baru
      </NuxtLink>
    </template>
  </AuthCard>
</template>
