<script setup lang="ts">
/**
 * Indeks modul panel admin.
 *
 * Halaman ini hanya menjadi pintu masuk navigasi: seluruh modul yang
 * mengelola data ditampilkan sebagai kartu tautan sehingga setiap modul
 * terjangkau dari satu tempat, terlepas dari lebar navigasi atas.
 *
 * Sengaja tidak menampilkan angka ringkasan — halaman indeks tidak
 * perlu memuat seluruh tabel hanya untuk menampilkan penghitung, dan
 * angka tersebut akan segera usang begitu data diubah di modul lain.
 */
import { ArrowRight } from "@lucide/vue";
import { AdminTopbar, AppToast } from "~/components/admin";
import { ADMIN_NAV_ITEMS } from "~/utils";

useHead({ title: "Admin — Semua Modul" });

/** Keterangan singkat tiap modul, menautkan ke halaman daftarnya. */
interface ModuleCard {
  key: string;
  title: string;
  summary: string;
  to: string;
}

const MODULES: ModuleCard[] = [
  {
    key: "project",
    title: "Project",
    summary: "Portofolio yang tampil pada bagian Work, lengkap dengan gambar dan tag.",
    to: "/admin/project",
  },
  {
    key: "service",
    title: "Layanan",
    summary: "Daftar layanan pada bagian What I do di halaman utama.",
    to: "/admin/service",
  },
  {
    key: "stat",
    title: "Statistik",
    summary: "Angka ber-akhiran pada hero halaman utama.",
    to: "/admin/stat",
  },
  {
    key: "stack-group",
    title: "Grup Stack",
    summary: "Kepala kolom teknologi, misal Frontend atau Backend.",
    to: "/admin/stack-group",
  },
  {
    key: "stack-item",
    title: "Item Stack",
    summary: "Teknologi individual di dalam tiap grup.",
    to: "/admin/stack-item",
  },
  {
    key: "experience",
    title: "Pengalaman",
    summary: "Riwayat karier pada timeline, beserta poin pendukungnya.",
    to: "/admin/experience",
  },
  {
    key: "testimonial",
    title: "Testimoni",
    summary: "Kutipan klien pada bagian Quote; hanya yang aktif yang tampil.",
    to: "/admin/testimonial",
  },
  {
    key: "fact",
    title: "Fakta",
    summary: "Baris singkat bertanda pasang pada bagian About.",
    to: "/admin/fact",
  },
  {
    key: "contact-card",
    title: "Kartu Kontak",
    summary: "Kartu informasi kontak seperti ketersediaan dan waktu balas.",
    to: "/admin/contact-card",
  },
  {
    key: "social-link",
    title: "Tautan Sosial",
    summary: "Tautan menuju profil media sosial di bagian kontak.",
    to: "/admin/social-link",
  },
  {
    key: "profile",
    title: "Profil",
    summary: "Identitas, konfigurasi hero, about, dan kontak (satu baris tunggal).",
    to: "/admin/profile",
  },
];
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <AdminTopbar
      :nav-items="ADMIN_NAV_ITEMS"
      active-key="dashboard"
    />

    <main class="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
      <!-- Kepala halaman -->
      <div class="py-9">
        <div class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
          Admin · Dashboard
        </div>
        <h1 class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.85rem)] font-extrabold leading-[1.04] tracking-tight">
          Semua modul <span class="font-bold text-admin-muted-2">/ index</span>
        </h1>
        <p class="mt-3 max-w-[74ch] text-[.985rem] text-admin-muted">
          Pilih modul yang ingin dikelola. Setiap modul menyediakan tabel data,
          form tambah dan ubah, serta penghapusan berkonfirmasi.
        </p>
      </div>

      <!-- Daftar modul -->
      <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <li v-for="module in MODULES" :key="module.key">
          <NuxtLink
            :to="module.to"
            class="group flex h-full flex-col rounded-[20px] border border-admin-line bg-admin-card p-5 shadow-[0_1px_2px_rgba(16,24,40,.05)] transition hover:-translate-y-1 hover:border-admin-accent/40"
          >
            <div class="font-mono text-[.66rem] font-bold uppercase tracking-[.15em] text-admin-muted-2">
              {{ module.to }}
            </div>

            <h2 class="mt-2.5 font-display text-[1.12rem] font-extrabold tracking-tight">
              {{ module.title }}
            </h2>

            <p class="mt-2 flex-1 text-[.875rem] leading-relaxed text-admin-muted">
              {{ module.summary }}
            </p>

            <span
              class="mt-4 inline-flex items-center gap-1.5 text-[.79rem] font-bold text-admin-accent"
            >
              Buka modul
              <ArrowRight
                class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </main>

    <AppToast />
  </div>
</template>
