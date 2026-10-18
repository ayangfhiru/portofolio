<script setup lang="ts">
import { computed, ref } from "vue";
import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "@lucide/vue";
import { BaseInput, BaseTextarea, InputList } from "~/components/form";
import { adminCreate, adminPatch, extractApiError } from "~/utils";
import type { ApiResponse } from "~/types";
import type {
  ExperienceAdmin,
  ExperienceCreateInput,
  ExperienceFormState,
  ExperienceUpdateInput,
} from "~/types";

/**
 * Form pengalaman bersama untuk mode Create dan Update.
 *
 * - Mode `create` → `POST   /api/admin/experiences`     (payload lengkap)
 * - Mode `update` → `PATCH  /api/admin/experiences/:id` (hanya field berubah)
 *
 * Bagian "Poin Pendukung" adalah daftar baris yang dapat ditambah dan
 * dihapus. Daftar tersebut dikirim sebagai array teks, dan server
 * menyinkronkan ulang tabel anak `ExperiencePoint` sesuai urutannya.
 *
 * Komponen ini memegang seluruh state form, validasi, dan proses submit
 * sehingga halaman daftar cukup membuka modal, meneruskan `mode` +
 * `initialExperience`, dan memuat ulang data ketika `saved` dipancarkan.
 *
 * Pesan tampil lewat banner ber-`role` alih-alih `window.alert`, dan
 * server tetap menjadi sumber validasi utama.
 */

type StatusType = "idle" | "success" | "error";

interface Status {
  type: StatusType;
  message: string;
}

const props = withDefaults(
  defineProps<{
    /** Menentukan endpoint tujuan dan perilaku validasi. */
    mode: "create" | "update";
    /** Data awal untuk mode update; `null` untuk mode create. */
    initialExperience?: ExperienceAdmin | null;
    /** Label tombol submit; menyesuaikan mode bila tidak diisi. */
    submitLabel?: string;
    /**
     * Bila diisi, tombol Batal ikut ditampilkan pada bilah aksi —
     * dipakai saat form ditampilkan di dalam modal.
     */
    cancelLabel?: string;
  }>(),
  { initialExperience: null, submitLabel: "", cancelLabel: "" },
);

const emit = defineEmits<{
  /** Dipancarkan setelah server mengonfirmasi penyimpanan. */
  saved: [experience: ExperienceAdmin];
  /** Dipancarkan saat pengguna menekan tombol Batal. */
  cancel: [];
}>();

/** Isi form kosong — dipakai sebagai dasar keadaan awal mode create. */
const emptyForm = (): ExperienceFormState => ({
  role: "",
  dateLabel: "",
  company: "",
  description: "",
  order: "0",
  points: [],
});

/** Isi form dari data yang sudah ada — dipakai untuk mengisi mode update. */
const formFromExperience = (
  experience: ExperienceAdmin,
): ExperienceFormState => ({
  role: experience.role,
  dateLabel: experience.dateLabel,
  company: experience.company,
  description: experience.description,
  order: String(experience.order),
  // Disalin agar perubahan baris tidak ikut mengubah data induk.
  points: [...experience.points],
});

const form = ref<ExperienceFormState>(
  props.initialExperience
    ? formFromExperience(props.initialExperience)
    : emptyForm(),
);

const errors = ref<Record<string, string>>({});
const status = ref<Status>({ type: "idle", message: "" });
const submitting = ref(false);

const isUpdate = computed(() => props.mode === "update");
const heading = computed(
  () =>
    props.submitLabel ||
    (isUpdate.value ? "Simpan Perubahan" : "Simpan Pengalaman"),
);

/* --------------------------------------------------- Daftar poin */

/* ------------------------------------------------------- Validasi */

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

  if (!form.value.role.trim()) {
    next.role = "Jabatan wajib diisi.";
  }

  if (!form.value.dateLabel.trim()) {
    next.dateLabel = "Label tanggal wajib diisi.";
  }

  if (!form.value.company.trim()) {
    next.company = "Nama perusahaan wajib diisi.";
  }

  if (!form.value.description.trim()) {
    next.description = "Deskripsi wajib diisi.";
  }

  const order = Number(form.value.order);
  if (!Number.isInteger(order) || order < 0) {
    next.order = "Urutan harus berupa bilangan bulat nol atau lebih.";
  }

  // Baris poin yang dikirim harus seluruhnya berisi teks.
  if (form.value.points.some((point) => !point.trim())) {
    next.points = "Setiap poin wajib berisi teks. Hapus baris kosong.";
  }

  return next;
};

const setStatus = (type: StatusType, message: string): void => {
  status.value = { type, message };
};

/** Bangun payload untuk mode create (semua field ikut dikirim). */
const buildCreatePayload = (): ExperienceCreateInput => ({
  role: form.value.role.trim(),
  dateLabel: form.value.dateLabel.trim(),
  company: form.value.company.trim(),
  description: form.value.description.trim(),
  order: Number(form.value.order),
  points: form.value.points.map((point) => point.trim()),
});

/**
 * Bangun payload untuk mode update berisi **hanya field yang berubah**.
 *
 * Daftar poin dibandingkan terhadap poin awal; bila sama persis (termasuk
 * urutannya) poin tidak ikut dikirim sehingga tabel anak tidak ditulis
 * ulang tanpa perlu.
 * Mengembalikan `null` bila tidak ada perubahan sama sekali.
 */
const buildUpdatePayload = (): ExperienceUpdateInput | null => {
  const experience = props.initialExperience;
  if (!experience) return null;

  const payload: ExperienceUpdateInput = {};
  const current = form.value;

  if (current.role.trim() !== experience.role) {
    payload.role = current.role.trim();
  }

  if (current.dateLabel.trim() !== experience.dateLabel) {
    payload.dateLabel = current.dateLabel.trim();
  }

  if (current.company.trim() !== experience.company) {
    payload.company = current.company.trim();
  }

  if (current.description.trim() !== experience.description) {
    payload.description = current.description.trim();
  }

  if (Number(current.order) !== experience.order) {
    payload.order = Number(current.order);
  }

  // Pembanding pakai pemisah yang mustahil muncul di teks biasa agar
  // perbandingan tidak keliru bila ada poin dengan panjang berbeda.
  const nextPoints = current.points.map((point) => point.trim());
  if (nextPoints.join("\u0000") !== experience.points.join("\u0000")) {
    payload.points = nextPoints;
  }

  return Object.keys(payload).length > 0 ? payload : null;
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
    let saved: ApiResponse<ExperienceAdmin>;

    if (isUpdate.value) {
      const payload = buildUpdatePayload();

      // Tidak ada yang berubah — jangan kirim permintaan sama sekali.
      if (!payload) {
        setStatus("error", "Tidak ada perubahan untuk disimpan.");
        return;
      }

      saved = await adminPatch<ExperienceAdmin>(
        "experiences",
        props.initialExperience?.id ?? "",
        payload,
      );
    } else {
      saved = await adminCreate<ExperienceAdmin>(
        "experiences",
        buildCreatePayload(),
      );
    }

    if (!saved.success || !saved.data) {
      throw new Error(saved.error ?? "Server tidak mengonfirmasi penyimpanan.");
    }

    // Kembalikan form ke keadaan bersih tanpa menyentuh nilai user
    // sebelum server benar-benar mengonfirmasi (mencegah pengiriman ganda).
    form.value = isUpdate.value ? formFromExperience(saved.data) : emptyForm();

    setStatus(
      "success",
      isUpdate.value
        ? "Perubahan berhasil disimpan."
        : "Pengalaman berhasil dibuat.",
    );

    // Beri tahu induk (mis. untuk memuat ulang daftar atau menutup modal).
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
  <div>
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

      <div class="grid gap-5">
        <!-- Jabatan -->
        <BaseInput
          v-model="form.role"
          name="role"
          title="Jabatan"
          placeholder="Mis. Frontend Engineer"
          required
          :disabled="submitting"
          :error="errors.role"
          @clear-error="clearError('role')"
        />

        <!-- Label tanggal -->
        <BaseInput
          v-model="form.dateLabel"
          name="dateLabel"
          title="Label Tanggal"
          placeholder="Mis. 2023 — Present"
          required
          :disabled="submitting"
          :error="errors.dateLabel"
          @clear-error="clearError('dateLabel')"
        />

        <!-- Perusahaan -->
        <BaseInput
          v-model="form.company"
          name="company"
          title="Perusahaan"
          placeholder="Mis. Nimbus Labs"
          required
          :disabled="submitting"
          :error="errors.company"
          @clear-error="clearError('company')"
        />

        <!-- Deskripsi -->
        <BaseTextarea
          v-model="form.description"
          title="Deskripsi"
          placeholder="Ringkasan singkat peran dan lingkup pekerjaan."
          required
          :disabled="submitting"
          :error="errors.description"
          @clear-error="clearError('description')"
        />

        <!-- Urutan -->
        <BaseInput
          v-model="form.order"
          name="order"
          title="Urutan Tampil"
          type="number"
          placeholder="0"
          :disabled="submitting"
          :error="errors.order"
          @clear-error="clearError('order')"
        />
        <p class="-mt-3 text-xs text-slate-400">
          Angka lebih kecil tampil lebih awal pada timeline
          <b class="text-slate-600">Experience</b> di halaman utama.
        </p>

        <!-- Poin pendukung -->
        <InputList
          v-model="form.points"
          title="Poin Pendukung"
          item-prefix="Poin"
          add-label="Tambah Poin"
          empty-hint="Belum ada poin. Poin tampil sebagai daftar butir di bawah deskripsi pada bagian Experience."
          :error="errors.points"
          :disabled="submitting"
          @clear-error="clearError('points')"
        />
      </div>

      <div class="mt-7 flex flex-wrap gap-2.5">
        <!-- Tombol Batal (hanya bila dipakai di dalam modal) -->
        <button
          v-if="props.cancelLabel"
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] border border-admin-line-2 bg-white px-[18px] py-2.5 text-sm font-bold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          :disabled="submitting"
          @click="emit('cancel')"
        >
          {{ props.cancelLabel }}
        </button>

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

          <span>{{ submitting ? "Menyimpan..." : heading }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
