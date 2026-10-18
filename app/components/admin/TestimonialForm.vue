<script setup lang="ts">
import { computed, ref } from "vue";
import { AlertCircle, CheckCircle2, LoaderCircle, Save } from "@lucide/vue";
import { BaseCheckbox, BaseInput, BaseTextarea } from "~/components/form";
import { adminCreate, adminPatch, extractApiError } from "~/utils";
import type { ApiResponse } from "~/types";
import type {
  TestimonialAdmin,
  TestimonialCreateInput,
  TestimonialFormState,
  TestimonialUpdateInput,
} from "~/types";

/**
 * Form testimoni bersama untuk mode Create dan Update.
 *
 * - Mode `create` → `POST   /api/admin/testimonials`      (payload lengkap)
 * - Mode `update` → `PATCH  /api/admin/testimonials/:id`  (hanya field berubah)
 *
 * Komponen ini memegang seluruh state form, validasi, dan proses submit
 * sehingga halaman daftar cukup membuka modal, meneruskan `mode` +
 * `initialTestimonial`, dan memuat ulang data ketika `saved` dipancarkan.
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
    initialTestimonial?: TestimonialAdmin | null;
    /** Label tombol submit; menyesuaikan mode bila tidak diisi. */
    submitLabel?: string;
    /**
     * Bila diisi, tombol Batal ikut ditampilkan pada bilah aksi —
     * dipakai saat form ditampilkan di dalam modal.
     */
    cancelLabel?: string;
  }>(),
  { initialTestimonial: null, submitLabel: "", cancelLabel: "" },
);

const emit = defineEmits<{
  /** Dipancarkan setelah server mengonfirmasi penyimpanan. */
  saved: [testimonial: TestimonialAdmin];
  /** Dipancarkan saat pengguna menekan tombol Batal. */
  cancel: [];
}>();

/** Isi form kosong — dipakai sebagai dasar keadaan awal mode create. */
const emptyForm = (): TestimonialFormState => ({
  quote: "",
  authorName: "",
  authorRole: "",
  authorImage: "",
  active: true,
  order: "0",
});

/** Isi form dari data yang sudah ada — dipakai untuk mengisi mode update. */
const formFromTestimonial = (
  testimonial: TestimonialAdmin,
): TestimonialFormState => ({
  quote: testimonial.quote,
  authorName: testimonial.authorName,
  authorRole: testimonial.authorRole,
  authorImage: testimonial.authorImage,
  active: testimonial.active,
  order: String(testimonial.order),
});

const form = ref<TestimonialFormState>(
  props.initialTestimonial
    ? formFromTestimonial(props.initialTestimonial)
    : emptyForm(),
);

const errors = ref<Record<string, string>>({});
const status = ref<Status>({ type: "idle", message: "" });
const submitting = ref(false);

const isUpdate = computed(() => props.mode === "update");
const heading = computed(
  () =>
    props.submitLabel ||
    (isUpdate.value ? "Simpan Perubahan" : "Simpan Testimoni"),
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

  if (!form.value.quote.trim()) {
    next.quote = "Kutipan wajib diisi.";
  }

  if (!form.value.authorName.trim()) {
    next.authorName = "Nama penulis wajib diisi.";
  }

  if (!form.value.authorRole.trim()) {
    next.authorRole = "Jabatan penulis wajib diisi.";
  }

  if (!form.value.authorImage.trim()) {
    next.authorImage = "URL foto penulis wajib diisi.";
  }

  // `Number()` menangani nilai string maupun number dari input type=number.
  const order = Number(form.value.order);
  if (!Number.isInteger(order) || order < 0) {
    next.order = "Urutan harus berupa bilangan bulat nol atau lebih.";
  }

  return next;
};

const setStatus = (type: StatusType, message: string): void => {
  status.value = { type, message };
};

/** Bangun payload untuk mode create (semua field ikut dikirim). */
const buildCreatePayload = (): TestimonialCreateInput => ({
  quote: form.value.quote.trim(),
  authorName: form.value.authorName.trim(),
  authorRole: form.value.authorRole.trim(),
  authorImage: form.value.authorImage.trim(),
  active: form.value.active,
  order: Number(form.value.order),
});

/**
 * Bangun payload untuk mode update berisi **hanya field yang berubah**.
 *
 * Server mempertahankan semua key yang tidak ada dalam payload, jadi
 * mengirim hanya perbedaan menjaga permintaan tetap minimal dan
 * menghindari menimpa perubahan yang dibuat orang lain.
 * Mengembalikan `null` bila tidak ada perubahan sama sekali.
 */
const buildUpdatePayload = (): TestimonialUpdateInput | null => {
  const testimonial = props.initialTestimonial;
  if (!testimonial) return null;

  const payload: TestimonialUpdateInput = {};
  const current = form.value;

  if (current.quote.trim() !== testimonial.quote) {
    payload.quote = current.quote.trim();
  }

  if (current.authorName.trim() !== testimonial.authorName) {
    payload.authorName = current.authorName.trim();
  }

  if (current.authorRole.trim() !== testimonial.authorRole) {
    payload.authorRole = current.authorRole.trim();
  }

  if (current.authorImage.trim() !== testimonial.authorImage) {
    payload.authorImage = current.authorImage.trim();
  }

  if (current.active !== testimonial.active) {
    payload.active = current.active;
  }

  if (Number(current.order) !== testimonial.order) {
    payload.order = Number(current.order);
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
    let saved: ApiResponse<TestimonialAdmin>;

    if (isUpdate.value) {
      const payload = buildUpdatePayload();

      // Tidak ada yang berubah — jangan kirim permintaan sama sekali.
      if (!payload) {
        setStatus("error", "Tidak ada perubahan untuk disimpan.");
        return;
      }

      saved = await adminPatch<TestimonialAdmin>(
        "testimonials",
        props.initialTestimonial?.id ?? "",
        payload,
      );
    } else {
      saved = await adminCreate<TestimonialAdmin>(
        "testimonials",
        buildCreatePayload(),
      );
    }

    if (!saved.success || !saved.data) {
      throw new Error(saved.error ?? "Server tidak mengonfirmasi penyimpanan.");
    }

    // Kembalikan form ke keadaan bersih tanpa menyentuh nilai user
    // sebelum server benar-benar mengonfirmasi (mencegah pengiriman
    // ganda).
    form.value = isUpdate.value
      ? formFromTestimonial(saved.data)
      : emptyForm();

    setStatus(
      "success",
      isUpdate.value
        ? "Perubahan berhasil disimpan."
        : "Testimoni berhasil dibuat.",
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
        <!-- Kutipan -->
        <BaseTextarea
          v-model="form.quote"
          title="Kutipan"
          placeholder="Tuliskan kutipan klien di sini…"
          required
          :error="errors.quote"
          @clear-error="clearError('quote')"
        />
        <p class="-mt-3 text-xs text-slate-400">
          Frasa yang dibungkus <b class="text-slate-600">**dua bintang**</b>
          akan tampil menonjol berwarna aksen.
        </p>

        <!-- Nama penulis -->
        <BaseInput
          v-model="form.authorName"
          name="authorName"
          title="Nama Penulis"
          placeholder="Mis. Andra Prasetyo"
          required
          :error="errors.authorName"
          @clear-error="clearError('authorName')"
        />

        <!-- Jabatan penulis -->
        <BaseInput
          v-model="form.authorRole"
          name="authorRole"
          title="Jabatan Penulis"
          placeholder="Mis. Product Lead, Nimbus"
          required
          :error="errors.authorRole"
          @clear-error="clearError('authorRole')"
        />

        <!-- Foto penulis -->
        <BaseInput
          v-model="form.authorImage"
          name="authorImage"
          title="Foto Penulis (URL)"
          type="url"
          placeholder="https://…"
          required
          :error="errors.authorImage"
          @clear-error="clearError('authorImage')"
        />
        <p class="-mt-3 text-xs text-slate-400">
          URL gambar bulat yang tampil di samping kutipan.
        </p>

        <!-- Status tampil -->
        <BaseCheckbox
          v-model="form.active"
          title="Tampilkan di halaman utama"
          description="Hanya testimoni aktif yang tampil pada bagian Quote di halaman utama."
        />

        <!-- Urutan -->
        <BaseInput
          v-model="form.order"
          name="order"
          title="Urutan Tampil"
          type="number"
          placeholder="0"
          :error="errors.order"
          @clear-error="clearError('order')"
        />
        <p class="-mt-3 text-xs text-slate-400">
          Angka lebih kecil tampil lebih awal pada bagian
          <b class="text-slate-600">Quote</b> di halaman utama.
        </p>
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
