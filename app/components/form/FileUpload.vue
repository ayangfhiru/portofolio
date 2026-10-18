<script setup lang="ts">
/**
 * Komponen unggah file generik.
 *
 * Dipakai untuk memindahkan satu file dari browser ke folder `public/`
 * yang ditentukan lewat prop `path`, lalu memancarkan URL publik hasilnya
 * lewat `v-model` sehingga induk tinggal menyimpannya ke database.
 *
 * Alurnya:
 * 1. User memilih file → **nama file asli langsung ditampilkan**.
 * 2. Komponen mengunggah ke `POST /api/admin/upload` bersama `path`.
 * 3. Server memindahkan file dengan **nama unik** (nama asli tidak
 *    dipakai untuk nama di disk) dan membuat folder tujuan bila belum ada.
 * 4. Nama file hasil pemindahan + path-nya ditampilkan, dan `v-model`
 *    diisi `publicUrl` (mis. `/uploads/projects/1792-1a2b3c4d.png`).
 *
 * Komponen ini tidak terikat gambar: `accept` dan `path` bebas diatur oleh
 * pemanggil, sehingga bisa dipakai untuk dokumen atau jenis file lain.
 * Batas ukuran dan penolakan file berbahaya ditangani server.
 */
import { LoaderCircle, Paperclip, X } from "@lucide/vue";
import { computed, ref, watch } from "vue";
import type { ApiResponse, MoveImageResult } from "~/types";
import { extractApiError } from "~/utils";

interface Props {
  /**
   * Folder tujuan relatif terhadap `public/`, contoh `uploads/projects`.
   * Wajib diisi agar pemanggil menentukan sendiri tempat penyimpanannya.
   * Folder yang belum ada dibuat otomatis oleh server.
   */
  path: string;
  title?: string;
  name?: string;
  /** Nilai `accept` pada input file, mis. `image/png,.pdf`. */
  accept?: string;
  hint?: string;
  /** Error validasi dari induk (mis. "URL gambar wajib diisi."). */
  error?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Unggah File",
  name: "file",
  accept: "",
  hint: "",
  error: "",
  disabled: false,
});

const emit = defineEmits<{
  /** Meminta induk menghapus error validasi pada field terkait. */
  "clear-error": [];
  /** Dipancarkan setelah file berhasil dipindahkan ke folder tujuan. */
  uploaded: [result: MoveImageResult];
}>();

/** URL publik hasil unggahan — nilai yang disimpan induk ke database. */
const model = defineModel<string>({ default: "" });

const input = ref<HTMLInputElement | null>(null);
/** File pilihan user; ditampilkan sebagai nama asli. */
const selectedFile = ref<File | null>(null);
/** Hasil unggahan terakhir milik komponen ini. */
const uploaded = ref<MoveImageResult | null>(null);
const uploading = ref(false);
const uploadError = ref("");

/** Error validasi induk didahulukan, lalu error unggahan komponen. */
const message = computed(() => props.error || uploadError.value);

const inputId = computed(
  () => props.name || props.title.toLowerCase().replace(/\s+/g, "-"),
);
const errorId = computed(() => `${inputId.value}-error`);

/** Tombol Hapus hanya muncul bila memang ada yang bisa dibersihkan. */
const canClear = computed(
  () => selectedFile.value !== null || uploaded.value !== null,
);

/**
 * Kosongkan `<input type="file">` tanpa menyentuh nilai model.
 * Diperlukan agar user bisa memilih file yang sama lagi — tanpa ini
 * `change` tidak menyala untuk file kembar.
 */
const resetInput = (): void => {
  if (input.value) input.value.value = "";
};

const handleFileChange = async (event: Event): Promise<void> => {
  if (!(event.target instanceof HTMLInputElement)) return;

  const file = event.target.files?.[0] ?? null;
  if (!file || uploading.value) return;

  uploadError.value = "";
  selectedFile.value = file;
  uploaded.value = null;
  uploading.value = true;

  try {
    const body = new FormData();
    body.set("path", props.path);
    body.set("file", file);

    const response = await $fetch<ApiResponse<MoveImageResult>>(
      "/api/admin/upload",
      { method: "POST", body },
    );

    if (!response.success || !response.data) {
      uploadError.value =
        response.error ?? "Server tidak mengembalikan hasil unggahan.";
      return;
    }

    uploaded.value = response.data;
    model.value = response.data.publicUrl;
    emit("clear-error");
    emit("uploaded", response.data);
  } catch (error) {
    // Pesan server diteruskan apa adanya; form tidak kehilangan nilai lain.
    uploadError.value = extractApiError(error).message;
  } finally {
    uploading.value = false;
    resetInput();
  }
};

/** Batalkan unggahan dan kembalikan nilai model ke keadaan semula. */
const clear = (): void => {
  selectedFile.value = null;
  uploaded.value = null;
  uploadError.value = "";
  model.value = "";
  resetInput();
  emit("clear-error");
};

/**
 * Jaga agar tampilan tidak menampilkan sisa unggahan lama ketika induk
 * mengganti nilai (mis. setelah form disimpan ulang atau dikosongkan).
 */
watch(model, (value) => {
  if (uploaded.value && value !== uploaded.value.publicUrl) {
    uploaded.value = null;
    selectedFile.value = null;
    uploadError.value = "";
  }
});
</script>

<template>
  <div>
    <label :for="inputId" class="mb-2 block text-sm font-medium text-slate-700">
      {{ props.title }}
    </label>

    <input
      :id="inputId"
      ref="input"
      type="file"
      :name="props.name"
      :accept="props.accept || undefined"
      :disabled="props.disabled || uploading"
      :aria-invalid="!!message"
      :aria-describedby="message ? errorId : undefined"
      class="w-full cursor-pointer rounded-xl border bg-white p-1.5 text-sm text-slate-900 outline-none transition file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:file:bg-slate-100 disabled:file:text-slate-400"
      :class="
        message
          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
          : 'border-slate-200 hover:border-slate-300 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10'
      "
      @change="handleFileChange"
    />

    <p v-if="props.hint" class="mt-1.5 text-xs text-slate-400">
      {{ props.hint }}
    </p>

    <!-- Status pemilihan & hasil pemindahan file -->
    <div
      v-if="selectedFile || uploaded || model"
      class="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs"
    >
      <div class="flex items-start gap-2.5">
        <Paperclip
          class="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden="true"
        />

        <div class="min-w-0 flex-1 space-y-1.5">
          <p v-if="uploading" class="flex items-center gap-1.5 text-slate-500">
            <LoaderCircle
              class="h-3.5 w-3.5 shrink-0 animate-spin"
              aria-hidden="true"
            />
            Mengunggah {{ selectedFile?.name }}…
          </p>

          <template v-else>
            <p v-if="selectedFile">
              <span class="text-slate-500">File asli:</span>
              <span class="ml-1 break-all font-medium text-slate-800">
                {{ selectedFile.name }}
              </span>
            </p>

            <p v-if="uploaded">
              <span class="text-slate-500">Nama setelah dipindah:</span>
              <span class="ml-1 break-all font-medium text-slate-800">
                {{ uploaded.fileName }}
              </span>
            </p>

            <p v-if="uploaded">
              <span class="text-slate-500">Path tersimpan:</span>
              <code class="ml-1 break-all font-mono text-[11px] text-slate-700">
                {{ model }}
              </code>
            </p>

            <p v-if="!selectedFile && !uploaded && model">
              <span class="text-slate-500">Nilai saat ini:</span>
              <code class="ml-1 break-all font-mono text-[11px] text-slate-700">
                {{ model }}
              </code>
            </p>
          </template>
        </div>

        <button
          v-if="canClear && !uploading"
          type="button"
          class="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="props.disabled"
          @click="clear"
        >
          <X class="h-3 w-3" aria-hidden="true" />
          Hapus
        </button>
      </div>
    </div>

    <p
      v-if="message"
      :id="errorId"
      class="mt-1.5 text-sm text-red-500"
      role="alert"
    >
      {{ message }}
    </p>
  </div>
</template>
