<script setup lang="ts">
/**
 * Halaman pendaftaran akun admin baru.
 *
 * Akses tamu saja: pengguna yang sudah punya sesi aktif akan dialihkan
 * ke dashboard oleh `guest.global.ts`.
 */
import { AuthCard, RegisterForm } from "~/components/auth";

useHead({ title: "Daftar — Admin" });
</script>

<template>
  <AuthCard
    eyebrow="Admin · Daftar"
    title="Buat akun panel"
    description="Daftarkan satu akun untuk mengelola isi portfolio. Kata sandi disimpan dalam bentuk ter-hash dan diverifikasi oleh sistem autentikasi aplikasi."
  >
    <RegisterForm />

    <template #footer>
      Sudah punya akun?
      <NuxtLink
        to="/login"
        class="font-semibold text-admin-accent transition-colors hover:text-admin-accent-dark"
      >
        Masuk di sini
      </NuxtLink>
    </template>
  </AuthCard>
</template>
