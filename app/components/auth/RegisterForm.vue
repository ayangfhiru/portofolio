<script setup lang="ts">
/**
 * Form pendaftaran akun baru.
 *
 * Pola yang dipakai sama dengan `LoginForm`: validasi klien memakai
 * `registerSchema` (kontrak yang sama dengan kebijakan password server),
 * request diteruskan ke `useAuth().signUp` yang memanggil endpoint resmi
 * Better Auth, dan tombol dinonaktifkan selama request berjalan.
 *
 * Arah tujuan sesudah daftar **tidak diasumsikan**. Sesi dibaca ulang dari
 * server; bila ternyata tidak terbentuk (mis. kebijakan verifikasi email
 * diaktifkan kelak), pengguna diarahkan ke halaman login alih-alih
 * dianggap sudah masuk.
 */
import { AlertCircle, Eye, EyeOff, LoaderCircle, UserPlus } from "@lucide/vue";
import { ref } from "vue";
import { BaseInput } from "~/components/form";
import { useAuth } from "~/composables";
import type { RegisterFormValues } from "~/utils";
import {
  PASSWORD_MIN_LENGTH,
  registerSchema,
  toFieldErrors,
} from "~/utils";

const { signUp, isLoading } = useAuth();

const form = ref<RegisterFormValues>({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const errors = ref<Record<string, string>>({});
const formError = ref("");
const showPassword = ref(false);

/** Hilangkan pesan galat satu lapangan begitu pengguna mulai mengetik. */
const clearError = (field: string): void => {
  if (errors.value[field]) {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
};

const handleSubmit = async (): Promise<void> => {
  if (isLoading.value) return;

  formError.value = "";

  const parsed = registerSchema.safeParse(form.value);
  if (!parsed.success) {
    const found = toFieldErrors(parsed.error);
    if (found.form) {
      formError.value = found.form;
      delete found.form;
    }
    errors.value = found;
    return;
  }

  errors.value = {};

  const result = await signUp(parsed.data);

  if (result.error) {
    formError.value = result.error;
    return;
  }

  if (!result.authenticated) {
    // Pendaftaran sukses tetapi tidak menghasilkan sesi aktif — beri
    // tahu pengguna di halaman login, jangan mengarang status masuk.
    await navigateTo({ path: "/login", query: { registered: "1" } });
    return;
  }

  await navigateTo("/admin");
};
</script>

<template>
  <form class="grid gap-5" novalidate @submit.prevent="handleSubmit">
    <!-- Banner kesalahan server / jaringan -->
    <div
      v-if="formError"
      role="alert"
      class="flex items-start gap-3 rounded-xl border border-[#f2c9c5] bg-admin-accent-soft px-4 py-3 text-sm text-admin-accent-dark"
    >
      <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{{ formError }}</p>
    </div>

    <BaseInput
      v-model="form.name"
      title="Nama lengkap"
      type="text"
      name="name"
      placeholder="Mis. Syang Ghege"
      autocomplete="name"
      required
      :error="errors.name"
      @clear-error="clearError('name')"
    />

    <BaseInput
      v-model="form.email"
      title="Email"
      type="email"
      name="email"
      placeholder="nama@domain.com"
      autocomplete="email"
      required
      :error="errors.email"
      @clear-error="clearError('email')"
    />

    <BaseInput
      v-model="form.password"
      title="Password"
      :type="showPassword ? 'text' : 'password'"
      name="password"
      placeholder="Minimal 8 karakter"
      autocomplete="new-password"
      required
      :error="errors.password"
      @clear-error="clearError('password')"
    >
      <template #trailing>
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-4 focus-visible:ring-[#D71920]/10 focus-visible:outline-none"
          :aria-label="
            showPassword ? 'Sembunyikan password' : 'Tampilkan password'
          "
          :aria-pressed="showPassword"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" class="h-4 w-4" aria-hidden="true" />
          <Eye v-else class="h-4 w-4" aria-hidden="true" />
        </button>
      </template>
    </BaseInput>

    <BaseInput
      v-model="form.confirmPassword"
      title="Konfirmasi password"
      :type="showPassword ? 'text' : 'password'"
      name="confirmPassword"
      autocomplete="new-password"
      required
      :error="errors.confirmPassword"
      @clear-error="clearError('confirmPassword')"
    />

    <p class="-mt-2 text-xs text-admin-muted-2">
      Password minimal {{ PASSWORD_MIN_LENGTH }} karakter dan berlaku sama
      untuk masuk ke panel.
    </p>

    <button
      type="submit"
      :disabled="isLoading"
      :aria-busy="isLoading"
      class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-admin-accent px-[18px] py-3 text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <LoaderCircle
        v-if="isLoading"
        class="h-4 w-4 animate-spin"
        aria-hidden="true"
      />
      <UserPlus v-else class="h-4 w-4" aria-hidden="true" />
      {{ isLoading ? "Memproses…" : "Daftar akun" }}
    </button>
  </form>
</template>
