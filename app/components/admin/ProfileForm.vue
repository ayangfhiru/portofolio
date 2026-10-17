<script setup lang="ts">
import { computed, ref } from "vue";
import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "@lucide/vue";
import { BaseInput, BaseTextarea, InputList } from "~/components/form";
import { adminPut, extractApiError } from "~/utils/admin-api";
import type { ApiResponse } from "~/types/api";
import type {
  ProfileAdmin,
  ProfileFormState,
  ProfileUpdateInput,
} from "~/types/profile";

/**
 * Form pengelolaan profil.
 *
 * Profil adalah singleton — hanya ada satu baris — sehingga form ini
 * TIDAK memiliki mode Create/Terpisah: seluruh penyimpanan berjalan
 * sebagai satu upsert lewat `PUT /api/admin/profile`.
 *
 * Kolom dikelompokkan mengikuti bagian halaman yang ditampungnya
 * (Identitas, Hero, About, Kontak) agar form panjang tetap mudah dipindai.
 *
 * Pesan tampil lewat banner ber-`role` alih-alih `window.alert`, dan
 * server tetap menjadi sumber validasi utama — aturan berikut dibuat
 * selaras dengan endpoint tersebut.
 */

type StatusType = "idle" | "success" | "error";

interface Status {
  type: StatusType;
  message: string;
}

const props = withDefaults(
  defineProps<{
    /** Profil tersimpan; `null` bila belum pernah dibuat (form kosong). */
    initialProfile?: ProfileAdmin | null;
    submitLabel?: string;
  }>(),
  { initialProfile: null, submitLabel: "Simpan Profil" },
);

const emit = defineEmits<{
  /** Dipancarkan setelah server mengonfirmasi penyimpanan. */
  saved: [profile: ProfileAdmin];
}>();

/** Isi form kosong — dipakai bila profil belum pernah dibuat. */
const emptyForm = (): ProfileFormState => ({
  fullName: "",
  brand: "",
  role: "",
  availabilityText: "",
  heroLead: "",
  rotatingWords: [],
  photoUrl: "",
  photoTagline: "",
  aboutNote: "",
  aboutParagraphs: [],
  badgeValue: "",
  badgeLabel: "",
  contactSubtitle: "",
  contactEmail: "",
  contactCallUrl: "",
});

/** Isi form dari profil tersimpan. */
const formFromProfile = (profile: ProfileAdmin): ProfileFormState => ({
  fullName: profile.fullName,
  brand: profile.brand,
  role: profile.role,
  availabilityText: profile.availabilityText,
  heroLead: profile.heroLead,
  // Disalin agar pengeditan baris tidak mengubah data induk.
  rotatingWords: [...profile.rotatingWords],
  photoUrl: profile.photoUrl,
  photoTagline: profile.photoTagline,
  aboutNote: profile.aboutNote,
  aboutParagraphs: [...profile.aboutParagraphs],
  badgeValue: profile.badgeValue,
  badgeLabel: profile.badgeLabel,
  contactSubtitle: profile.contactSubtitle,
  contactEmail: profile.contactEmail,
  // `null` di database diwakili string kosong pada form.
  contactCallUrl: profile.contactCallUrl ?? "",
});

const form = ref<ProfileFormState>(
  props.initialProfile ? formFromProfile(props.initialProfile) : emptyForm(),
);

const errors = ref<Record<string, string>>({});
const status = ref<Status>({ type: "idle", message: "" });
const submitting = ref(false);

/** Apakah profil sudah pernah disimpan sebelumnya? */
const hasProfile = computed(() => props.initialProfile !== null);

/** Hapus pesan error sebuah field begitu user mulai memperbaikinya. */
const clearError = (field: string): void => {
  if (errors.value[field]) {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
};

/**
 * Validasi sisi klien — selaras dengan aturan server
 * (server tetap menjadi sumber validasi utama).
 */
const validate = (): Record<string, string> => {
  const next: Record<string, string> = {};
  const current = form.value;

  const requireText = (field: keyof ProfileFormState, message: string): void => {
    if (!String(current[field]).trim()) next[field] = message;
  };

  requireText("fullName", "Nama lengkap wajib diisi.");
  requireText("brand", "Brand wajib diisi.");
  requireText("role", "Peran wajib diisi.");
  requireText("availabilityText", "Teks ketersediaan wajib diisi.");
  requireText("heroLead", "Kalimat pembuka hero wajib diisi.");
  requireText("photoUrl", "URL foto wajib diisi.");
  requireText("photoTagline", "Tagline foto wajib diisi.");
  requireText("aboutNote", "Catatan singkat wajib diisi.");
  requireText("badgeValue", "Nilai badge wajib diisi.");
  requireText("badgeLabel", "Label badge wajib diisi.");
  requireText("contactSubtitle", "Subjudul kontak wajib diisi.");
  requireText("contactEmail", "Email kontak wajib diisi.");

  if (current.rotatingWords.some((word) => !word.trim())) {
    next.rotatingWords = "Setiap kata berputar wajib berisi teks.";
  }

  if (current.aboutParagraphs.some((paragraph) => !paragraph.trim())) {
    next.aboutParagraphs = "Setiap paragraf wajib berisi teks.";
  }

  return next;
};

const setStatus = (type: StatusType, message: string): void => {
  status.value = { type, message };
};

/**
 * Bangun payload `PUT` — profil ditulis ulang seluruhnya, jadi semua
 * field ikut dikirim. `contactCallUrl` kosong dikirim sebagai `null`
 * agar kolomnya benar-benar kosong di database.
 */
const buildPayload = (): ProfileUpdateInput => {
  const current = form.value;

  return {
    fullName: current.fullName.trim(),
    brand: current.brand.trim(),
    role: current.role.trim(),
    availabilityText: current.availabilityText.trim(),
    heroLead: current.heroLead.trim(),
    rotatingWords: current.rotatingWords.map((word) => word.trim()),
    photoUrl: current.photoUrl.trim(),
    photoTagline: current.photoTagline.trim(),
    aboutNote: current.aboutNote.trim(),
    aboutParagraphs: current.aboutParagraphs.map((paragraph) => paragraph.trim()),
    badgeValue: current.badgeValue.trim(),
    badgeLabel: current.badgeLabel.trim(),
    contactSubtitle: current.contactSubtitle.trim(),
    contactEmail: current.contactEmail.trim(),
    contactCallUrl: current.contactCallUrl.trim() || null,
  };
};

const handleSubmit = async (): Promise<void> => {
  if (submitting.value) return;

  const found = validate();
  errors.value = found;

  if (Object.keys(found).length > 0) {
    setStatus("error", "Periksa kembali field yang ditandai merah.");
    return;
  }

  submitting.value = true;

  try {
    const saved: ApiResponse<ProfileAdmin> = await adminPut<ProfileAdmin>(
      "profile",
      buildPayload(),
    );

    if (!saved.success || !saved.data) {
      throw new Error(saved.error ?? "Server tidak mengonfirmasi penyimpanan.");
    }

    // Sinkronkan state form dengan hasil simpan server, lalu beri tahu induk.
    form.value = formFromProfile(saved.data);
    setStatus("success", "Profil berhasil disimpan.");
    emit("saved", saved.data);
  } catch (error) {
    // Nilai form tidak disentuh sehingga input user tetap utuh.
    setStatus("error", extractApiError(error).message);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <form class="px-5 py-6 sm:px-[30px]" novalidate @submit.prevent="handleSubmit">
    <!-- Banner pesan sukses / gagal -->
    <div
      v-if="status.message"
      :role="status.type === 'error' ? 'alert' : 'status'"
      class="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
      :class="
        status.type === 'error'
          ? 'border-[#f2c9c5] bg-admin-accent-soft text-admin-accent-dark'
          : 'border-[#bfdfd1] bg-admin-ok-soft text-admin-ok'
      "
    >
      <CheckCircle2
        v-if="status.type !== 'error'"
        class="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      />
      <AlertCircle v-else class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{{ status.message }}</p>
    </div>

    <!-- Identitas -->
    <section
      class="grid gap-5 border-t border-admin-line pt-6 first:border-t-0 first:pt-0"
      aria-label="Bagian identitas pemilik portfolio."
    >
      <h2 class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
        Identitas
      </h2>

      <BaseInput
        v-model="form.fullName"
        name="fullName"
        title="Nama Lengkap"
        placeholder="Mis. Raka Devano"
        required
        :disabled="submitting"
        :error="errors.fullName"
        @clear-error="clearError('fullName')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.brand"
          name="brand"
          title="Brand"
          placeholder="Mis. raka.dev"
          required
          :disabled="submitting"
          :error="errors.brand"
          @clear-error="clearError('brand')"
        />

        <BaseInput
          v-model="form.role"
          name="role"
          title="Peran"
          placeholder="Mis. Product Engineer"
          required
          :disabled="submitting"
          :error="errors.role"
          @clear-error="clearError('role')"
        />
      </div>
    </section>

    <!-- Hero -->
    <section
      class="grid gap-5 border-t border-admin-line pt-6"
      aria-label="Bagian hero di atas halaman utama."
    >
      <h2 class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
        Hero
      </h2>

      <BaseInput
        v-model="form.availabilityText"
        name="availabilityText"
        title="Teks Ketersediaan"
        placeholder="Mis. Available for freelance — Jakarta, ID"
        required
        :disabled="submitting"
        :error="errors.availabilityText"
        @clear-error="clearError('availabilityText')"
      />

      <BaseTextarea
        v-model="form.heroLead"
        title="Kalimat Pembuka"
        placeholder="Ringkasan singkat di bawah judul hero."
        required
        :disabled="submitting"
        :error="errors.heroLead"
        @clear-error="clearError('heroLead')"
      />
      <p class="-mt-3 text-xs text-slate-400">
        Frasa yang dibungkus <b class="text-slate-600">**dua bintang**</b>
        ditampilkan menonjol berwarna aksen.
      </p>

      <InputList
        v-model="form.rotatingWords"
        title="Kata Berputar"
        item-prefix="Kata"
        add-label="Tambah Kata"
        empty-hint="Belum ada kata. Bila kosong, hero menampilkan kalimat pembuka tanpa kata berputar."
        :error="errors.rotatingWords"
        :disabled="submitting"
        @clear-error="clearError('rotatingWords')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.photoUrl"
          name="photoUrl"
          title="URL Foto"
          type="url"
          placeholder="https://…"
          required
          :disabled="submitting"
          :error="errors.photoUrl"
          @clear-error="clearError('photoUrl')"
        />

        <BaseInput
          v-model="form.photoTagline"
          name="photoTagline"
          title="Tagline Foto"
          placeholder="Mis. EST. 2019"
          required
          :disabled="submitting"
          :error="errors.photoTagline"
          @clear-error="clearError('photoTagline')"
        />
      </div>
    </section>

    <!-- About -->
    <section
      class="grid gap-5 border-t border-admin-line pt-6"
      aria-label="Bagian About di halaman utama."
    >
      <h2 class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
        About
      </h2>

      <BaseTextarea
        v-model="form.aboutNote"
        title="Catatan Singkat"
        placeholder="Kalimat pendek di atas paragraf About."
        required
        :disabled="submitting"
        :error="errors.aboutNote"
        @clear-error="clearError('aboutNote')"
      />

      <InputList
        v-model="form.aboutParagraphs"
        title="Paragraf"
        item-prefix="Paragraf"
        add-label="Tambah Paragraf"
        empty-hint="Belum ada paragraf. Frasa **dua bintang** di dalamnya ditampilkan menonjol berwarna aksen."
        :error="errors.aboutParagraphs"
        :disabled="submitting"
        @clear-error="clearError('aboutParagraphs')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.badgeValue"
          name="badgeValue"
          title="Nilai Badge"
          placeholder="Mis. 99%"
          required
          :disabled="submitting"
          :error="errors.badgeValue"
          @clear-error="clearError('badgeValue')"
        />

        <BaseInput
          v-model="form.badgeLabel"
          name="badgeLabel"
          title="Label Badge"
          placeholder="Mis. On-time delivery across 48 shipped projects"
          required
          :disabled="submitting"
          :error="errors.badgeLabel"
          @clear-error="clearError('badgeLabel')"
        />
      </div>
    </section>

    <!-- Kontak -->
    <section
      class="grid gap-5 border-t border-admin-line pt-6"
      aria-label="Bagian Contact di halaman utama."
    >
      <h2 class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
        Kontak
      </h2>

      <BaseTextarea
        v-model="form.contactSubtitle"
        title="Subjudul Kontak"
        placeholder="Kalimat pengantar pada bagian Contact."
        required
        :disabled="submitting"
        :error="errors.contactSubtitle"
        @clear-error="clearError('contactSubtitle')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.contactEmail"
          name="contactEmail"
          title="Email Kontak"
          type="email"
          placeholder="Mis. hello@example.com"
          required
          :disabled="submitting"
          :error="errors.contactEmail"
          @clear-error="clearError('contactEmail')"
        />

        <BaseInput
          v-model="form.contactCallUrl"
          name="contactCallUrl"
          title="Tautan Panggilan (opsional)"
          type="url"
          placeholder="https://cal.com/…"
          :disabled="submitting"
          :error="errors.contactCallUrl"
          @clear-error="clearError('contactCallUrl')"
        />
      </div>
      <p class="-mt-3 text-xs text-slate-400">
        Kosongkan bila tombol <b class="text-slate-600">Book a call</b> tidak
        ditampilkan.
      </p>
    </section>

    <div class="mt-7 border-t border-admin-line pt-6">
      <button
        type="button"
        class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] bg-admin-accent px-[18px] py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        :disabled="submitting"
        :aria-busy="submitting"
        @click="handleSubmit"
      >
        <LoaderCircle
          v-if="submitting"
          class="h-4 w-4 shrink-0 animate-spin"
          aria-hidden="true"
        />

        <Save v-else class="h-4 w-4 shrink-0" aria-hidden="true" />

        <span>{{ submitting ? "Menyimpan..." : props.submitLabel }}</span>
      </button>

      <span class="ml-3 align-middle text-xs text-slate-400">
        <template v-if="hasProfile">
          Profil tersimpan sebagai satu baris tunggal — seluruh field di atas
          ditulis ulang pada penyimpanan.
        </template>
        <template v-else>
          Profil belum pernah dibuat. Penyimpanan pertama akan membuat barisnya.
        </template>
      </span>
    </div>
  </form>
</template>
