<script setup lang="ts">
import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "@lucide/vue";
import {
  BaseCheckbox,
  BaseInput,
  BaseSelect,
  BaseTextarea,
} from "~/components/form";
import { parseTagInput } from "~/utils/format";
import {
  extractApiError,
  patchProject,
  postProject,
} from "~/utils/post-project";
import type { ApiResponse } from "~/types/api";
import type {
  ProjectFormState,
  ProjectItem,
  ProjectPayload,
  ProjectUpdatePayload,
} from "~/types/project";

/**
 * Form project bersama untuk mode Create dan Update.
 *
 * - Mode `create`  → `POST /api/projects`      (payload lengkap)
 * - Mode `update`  → `PATCH /api/projects/:id` (hanya field yang berubah)
 *
 * Komponen ini memegang seluruh state form, validasi, dan proses submit
 * sehingga halaman `admin/project/create` dan `admin/project/[id]/edit`
 * tidak perlu menduplikasi logika apa pun.
 *
 * Mengikuti pola `pages/example/form.vue`: state `form` + `errors`,
 * tiap field memakai komponen `form/Base*`, dan pesan tampil lewat
 * banner ber-`role` alih-alih `window.alert`.
 */

type StatusType = "idle" | "success" | "error" | "info";
interface Status {
  type: StatusType;
  message: string;
}

const props = withDefaults(
  defineProps<{
    /** Menentukan endpoint tujuan dan perilaku validasi. */
    mode: "create" | "update";
    /** Data awal untuk mode update; `null` untuk mode create. */
    initialProject?: ProjectItem | null;
    /** Label tombol submit; menyesuaikan mode bila tidak diisi. */
    submitLabel?: string;
  }>(),
  { initialProject: null, submitLabel: "" },
);

const CATEGORY_OPTIONS = [
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "OSS", value: "oss" },
];

/** Isi form kosong — dipakai sebagai dasar keadaan awal mode create. */
const emptyForm = (): ProjectFormState => ({
  title: "",
  slug: "",
  description: "",
  category: "",
  year: "",
  imageUrl: "",
  href: "",
  featured: false,
  tags: "",
});

/** Isi form dari data yang sudah ada — dipakai untuk mengisi mode update. */
const formFromProject = (project: ProjectItem): ProjectFormState => ({
  title: project.title,
  slug: project.slug,
  description: project.description,
  category: project.category,
  year: String(project.year),
  imageUrl: project.imageUrl,
  href: project.href ?? "",
  featured: project.featured,
  tags: (project.tags ?? []).map((tag) => tag.name).join(", "),
});

const form = ref<ProjectFormState>(
  props.initialProject ? formFromProject(props.initialProject) : emptyForm(),
);

const errors = ref<Record<string, string>>({});
const status = ref<Status>({ type: "idle", message: "" });
const submitting = ref(false);
/** File gambar pilihan user; `null` berarti memakai `imageUrl`. */
const imageFile = ref<File | null>(null);

const isUpdate = computed(() => props.mode === "update");
const heading = computed(
  () => props.submitLabel || (isUpdate.value ? "Simpan Perubahan" : "Simpan Project"),
);

/** Hapus pesan error sebuah field begitu user mulai memperbaikinya. */
const clearError = (field: string): void => {
  if (errors.value[field]) {
    const next = { ...errors.value };
    delete next[field];
    errors.value = next;
  }
};

/**
 * Validasi sisi klien — sengaja dibuat selaras dengan aturan server
 * (server tetap menjadi sumber validasi utama).
 */
const validate = (): Record<string, string> => {
  const next: Record<string, string> = {};

  if (!form.value.title.trim()) {
    next.title = "Judul wajib diisi.";
  }

  if (!form.value.description.trim()) {
    next.description = "Deskripsi wajib diisi.";
  }

  if (!form.value.category) {
    next.category = "Kategori wajib dipilih.";
  }

  // `Number()` menangani nilai string maupun number dari input type=number.
  const year = Number(form.value.year);
  if (!form.value.year || !Number.isInteger(year)) {
    next.year = "Tahun wajib diisi.";
  } else if (year < 1900 || year > 9999) {
    next.year = "Tahun harus antara 1900–9999.";
  }

  // Gambar wajib bila belum ada berkas terpilih DAN belum ada nilai awal.
  if (!imageFile.value && !form.value.imageUrl.trim() && !props.initialProject) {
    next.imageUrl = "Isi URL gambar atau pilih berkas gambar.";
  }

  if (!imageFile.value && form.value.href.trim() && !/^https?:\/\/\S+/i.test(form.value.href.trim())) {
    next.href = "Tautan harus diawali http:// atau https://.";
  }

  return next;
};

/** Bangun payload untuk mode create (semua field ikut dikirim). */
const buildCreatePayload = (): ProjectPayload => ({
  title: form.value.title.trim(),
  slug: form.value.slug.trim(),
  description: form.value.description.trim(),
  // Aman dis narrow di sini karena `validate()` sudah menjamin kategori
  // dipilih; TypeScript tidak bisa menyimpulkan hal itu sendiri.
  category: form.value.category as ProjectPayload["category"],
  year: Number(form.value.year),
  imageUrl: form.value.imageUrl.trim(),
  href: form.value.href.trim() || null,
  featured: form.value.featured,
  tags: parseTagInput(form.value.tags),
});

/**
 * Bangun payload untuk mode update berisi **hanya field yang berubah**.
 *
 * Perbandingan dilakukan terhadap `initialProject` sehingga nilai yang
 * tidak disentuh tidak ikut terkirim — server memang mempertahankan
 * semua key yang tidak ada dalam payload.
 * Mengembalikan `null` bila tidak ada perubahan sama sekali.
 */
const buildUpdatePayload = (): ProjectUpdatePayload | null => {
  const project = props.initialProject;
  if (!project) return null;

  const payload: ProjectUpdatePayload = {};
  const current = form.value;

  if (current.title.trim() !== project.title) {
    payload.title = current.title.trim();
  }

  // Slug kosong = biarkan slug lama tetap dipertahankan.
  if (current.slug.trim() && current.slug.trim().toLowerCase() !== project.slug) {
    payload.slug = current.slug.trim();
  }

  if (current.description.trim() !== project.description) {
    payload.description = current.description.trim();
  }

  if (current.category && current.category !== project.category) {
    payload.category = current.category;
  }

  if (Number(current.year) !== project.year) {
    payload.year = Number(current.year);
  }

  // Gambar hanya ikut dikirim bila user memilih berkas baru
  // (berkas ditangani lewat field `image` pada multipart).
  if (!imageFile.value && current.imageUrl.trim() !== project.imageUrl) {
    payload.imageUrl = current.imageUrl.trim();
  }

  const nextHref = current.href.trim() || null;
  if (nextHref !== (project.href ?? null)) {
    payload.href = nextHref;
  }

  if (current.featured !== project.featured) {
    payload.featured = current.featured;
  }

  const nextTags = parseTagInput(current.tags);
  const previousTags = (project.tags ?? []).map((tag) => tag.name);
  const sameTags =
    nextTags.length === previousTags.length &&
    nextTags.every((name, index) => name === previousTags[index]);
  if (!sameTags) {
    payload.tags = nextTags;
  }

  return Object.keys(payload).length > 0 ? payload : null;
};

/** Tampilkan pesan banner sesuai tipenya. */
const setStatus = (type: StatusType, message: string): void => {
  status.value = { type, message };
};

/**
 * Kirim form ke server.
 * Mencegah pengiriman ganda lewat guard `submitting`, mempertahankan
 * seluruh nilai form bila gagal, dan hanya mengirim field yang berubah
 * pada mode update.
 */
const handleSubmit = async (): Promise<void> => {
  if (submitting.value) return;

  status.value = { type: "idle", message: "" };
  errors.value = validate();

  if (Object.keys(errors.value).length > 0) {
    setStatus("error", "Periksa kembali field yang ditandai merah.");
    return;
  }

  const target = props.initialProject;

  // Mode update tanpa data asal berarti form terisi dari sumber yang tidak
  // lengkap; lebih baik berhenti daripada mengirim payload yang salah sasaran.
  if (isUpdate.value && !target) {
    setStatus("error", "Data project belum tersedia. Muat ulang halaman.");
    return;
  }

  submitting.value = true;

  try {
    let saved: ApiResponse<ProjectItem>;

    if (target) {
      const payload = buildUpdatePayload();

      // Tanpa perubahan dan tanpa berkas gambar baru → tidak ada yang perlu dikirim.
      if (!payload && !imageFile.value) {
        setStatus("info", "Tidak ada perubahan untuk disimpan.");
        return;
      }

      saved = await patchProject(target.id, payload ?? {}, imageFile.value);
    } else {
      saved = await postProject(buildCreatePayload(), imageFile.value);
    }

    if (!saved.success || !saved.data) {
      setStatus("error", saved.error ?? "Server tidak mengembalikan data.");
      return;
    }

    // Setelah berhasil, kembalikan form ke keadaan yang akurat:
    // mode update diselaraskan dengan data tersimpan agar perbandingan
    // "field yang berubah" tetap benar; mode create dikosongkan agar
    // tombol siap dipakai membuat project berikutnya tanpa risiko
    // pengiriman ganda.
    if (isUpdate.value) {
      form.value = formFromProject(saved.data);
    } else {
      form.value = emptyForm();
    }
    imageFile.value = null;

    setStatus(
      "success",
      isUpdate.value
        ? "Perubahan berhasil disimpan."
        : "Project berhasil dibuat.",
    );
  } catch (error) {
    // Nilai form tidak disentuh sehingga input user tetap utuh.
    setStatus("error", extractApiError(error).message);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <form class="px-4 py-6 sm:px-8 sm:py-8" novalidate @submit.prevent="handleSubmit">
      <!-- Banner pesan sukses / gagal / informasi -->
      <div
        v-if="status.message"
        :role="status.type === 'error' ? 'alert' : 'status'"
        class="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
        :class="{
          'border-red-200 bg-red-50 text-red-700': status.type === 'error',
          'border-emerald-200 bg-emerald-50 text-emerald-700': status.type === 'success',
          'border-slate-200 bg-slate-50 text-slate-600': status.type === 'info',
          'border-slate-200 bg-white text-slate-600': status.type === 'idle',
        }"
      >
        <CheckCircle2
          v-if="status.type === 'success'"
          class="mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <AlertCircle
          v-else-if="status.type === 'error'"
          class="mt-0.5 h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <span>{{ status.message }}</span>
      </div>

      <div class="grid gap-5 sm:grid-cols-2">
        <!-- Judul -->
        <div class="sm:col-span-2">
          <BaseInput
            v-model="form.title"
            title="Judul Project"
            name="title"
            placeholder="Contoh: Nimbus Analytics"
            :required="true"
            :error="errors.title"
            :disabled="submitting"
            autocomplete="off"
            @clear-error="clearError('title')"
          />
        </div>

        <!-- Slug (opsional) -->
        <BaseInput
          v-model="form.slug"
          title="Slug URL"
          name="slug"
          placeholder="Kosongkan untuk otomatis dari judul"
          :error="errors.slug"
          :disabled="submitting"
          autocomplete="off"
          @clear-error="clearError('slug')"
        />

        <!-- Tahun -->
        <BaseInput
          v-model="form.year"
          title="Tahun"
          name="year"
          type="number"
          placeholder="Contoh: 2026"
          :required="true"
          :error="errors.year"
          :disabled="submitting"
          @clear-error="clearError('year')"
        />

        <!-- Kategori -->
        <BaseSelect
          v-model="form.category"
          title="Kategori"
          name="category"
          :options="CATEGORY_OPTIONS"
          placeholder="Pilih kategori"
          :required="true"
          :error="errors.category"
          :disabled="submitting"
          @clear-error="clearError('category')"
        />

        <!-- Tautan (opsional) -->
        <BaseInput
          v-model="form.href"
          title="Tautan Project"
          name="href"
          type="url"
          placeholder="https://example.com"
          :error="errors.href"
          :disabled="submitting"
          autocomplete="off"
          @clear-error="clearError('href')"
        />

        <!-- Deskripsi -->
        <div class="sm:col-span-2">
          <BaseTextarea
            v-model="form.description"
            title="Deskripsi"
            name="description"
            :rows="5"
            :maxlength="600"
            placeholder="Jelaskan project ini dalam beberapa kalimat…"
            :required="true"
            :error="errors.description"
            :disabled="submitting"
            @clear-error="clearError('description')"
          />
        </div>

        <!-- URL gambar -->
        <BaseInput
          v-model="form.imageUrl"
          title="URL Gambar"
          name="imageUrl"
          type="url"
          placeholder="https://…/cover.jpg"
          :required="!imageFile && !initialProject"
          :error="errors.imageUrl"
          :disabled="submitting || Boolean(imageFile)"
          autocomplete="off"
          @clear-error="clearError('imageUrl')"
        />

        <!-- Unggah gambar (opsional — menimpa URL bila dipilih) -->
        <BaseInput
          v-model="imageFile"
          title="Ganti Gambar"
          name="image"
          type="file"
          placeholder=""
          :error="errors.image"
          :disabled="submitting"
          @clear-error="clearError('image')"
        />

        <!-- Tags -->
        <div class="sm:col-span-2">
          <BaseInput
            v-model="form.tags"
            title="Tags"
            name="tags"
            placeholder="vue, nuxt, prisma"
            :error="errors.tags"
            :disabled="submitting"
            autocomplete="off"
            @clear-error="clearError('tags')"
          />
          <p class="mt-1.5 text-xs text-slate-400">
            Pisahkan dengan koma. Duplikat dan spasi berlebih dibuang otomatis.
          </p>
        </div>

        <!-- Sorotan / featured -->
        <div class="sm:col-span-2">
          <BaseCheckbox
            v-model="form.featured"
            title="Tampilkan sebagai project unggulan"
            description="Project unggulan tampil lebih besar pada bagian Work."
            name="featured"
            :disabled="submitting"
            :error="errors.featured"
            @clear-error="clearError('featured')"
          />
        </div>
      </div>
    </form>

    <!-- Footer aksi — meniru tata letak RegistrationNavigation -->
    <div class="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <!-- Ringkasan file terpilih / gambar saat ini -->
        <p class="text-xs text-slate-400">
          <template v-if="imageFile">
            Gambar baru: <span class="text-slate-600">{{ imageFile.name }}</span>
          </template>
          <template v-else-if="initialProject">
            Gambar saat ini: <span class="text-slate-600">{{ initialProject.imageUrl }}</span>
          </template>
          <template v-else>
            Belum ada gambar dipilih.
          </template>
        </p>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-red-600 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:border-red-700 hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="submitting"
          :aria-busy="submitting"
          @click="handleSubmit"
        >
          <!-- Ikon loading -->
          <LoaderCircle
            v-if="submitting"
            class="h-4 w-4 shrink-0 animate-spin"
            aria-hidden="true"
          />

          <!-- Ikon aksi -->
          <Save v-else class="h-4 w-4 shrink-0" aria-hidden="true" />

          <span>{{ submitting ? "Menyimpan..." : heading }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
