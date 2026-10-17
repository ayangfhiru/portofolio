<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, Save } from "@lucide/vue";
import { BaseInput, BaseSelect } from "~/components/form";
import {
  adminCreate,
  adminList,
  adminPatch,
  extractApiError,
} from "~/utils/admin-api";
import type { ApiResponse } from "~/types/api";
import type {
  StackGroupAdmin,
  StackItemAdmin,
  StackItemCreateInput,
  StackItemFormState,
  StackItemUpdateInput,
} from "~/types/stack";

/**
 * Form item stack bersama untuk mode Create dan Update.
 *
 * - Mode `create` → `POST   /api/admin/stack-items`     (payload lengkap)
 * - Mode `update` → `PATCH  /api/admin/stack-items/:id` (hanya field berubah)
 *
 * Bagian relasi memakai `BaseSelect` untuk memilih `StackGroup` — opsi
 * diambil dari `GET /api/admin/stack-groups` dan nilai yang dikirim ke
 * server berupa `id`, bukan judul grup, sesuai foreign key pada schema.
 *
 * Komponen ini memegang seluruh state form, validasi, dan proses submit
 * sehingga halaman daftar cukup membuka modal, meneruskan `mode` +
 * `initialItem`, dan memuat ulang data ketika `saved` dipancarkan.
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
    initialItem?: StackItemAdmin | null;
    /** Label tombol submit; menyesuaikan mode bila tidak diisi. */
    submitLabel?: string;
    /**
     * Bila diisi, tombol Batal ikut ditampilkan pada bilah aksi —
     * dipakai saat form ditampilkan di dalam modal.
     */
    cancelLabel?: string;
  }>(),
  { initialItem: null, submitLabel: "", cancelLabel: "" },
);

const emit = defineEmits<{
  /** Dipancarkan setelah server mengonfirmasi penyimpanan. */
  saved: [item: StackItemAdmin];
  /** Dipancarkan saat pengguna menekan tombol Batal. */
  cancel: [];
}>();

/* ------------------------------------------------- Opsi relasi grup */

const groups = ref<StackGroupAdmin[]>([]);
const groupsLoading = ref(false);
const groupsError = ref<string | null>(null);

/** Opsi `BaseSelect` — nilai berupa `id` grup sesuai foreign key. */
const groupOptions = computed(() =>
  groups.value.map((group) => ({ label: group.title, value: group.id })),
);

const hasGroups = computed(() => groups.value.length > 0);

/** Ambil daftar grup dari API. */
const loadGroups = async (): Promise<void> => {
  groupsLoading.value = true;
  groupsError.value = null;

  try {
    const response = await adminList<StackGroupAdmin>("stack-groups");

    if (!response.success || !response.data) {
      throw new Error(response.error ?? "Server tidak mengembalikan data grup.");
    }

    groups.value = response.data;
  } catch (error) {
    groups.value = [];
    groupsError.value = extractApiError(
      error,
      "Gagal memuat daftar grup stack.",
    ).message;
  } finally {
    groupsLoading.value = false;
  }
};

onMounted(loadGroups);

/* ------------------------------------------------------- State form */

/** Isi form kosong — dipakai sebagai dasar keadaan awal mode create. */
const emptyForm = (): StackItemFormState => ({
  name: "",
  groupId: "",
  order: "0",
});

/** Isi form dari data yang sudah ada — dipakai untuk mengisi mode update. */
const formFromItem = (item: StackItemAdmin): StackItemFormState => ({
  name: item.name,
  groupId: item.groupId,
  order: String(item.order),
});

const form = ref<StackItemFormState>(
  props.initialItem ? formFromItem(props.initialItem) : emptyForm(),
);

const errors = ref<Record<string, string>>({});
const status = ref<Status>({ type: "idle", message: "" });
const submitting = ref(false);

const isUpdate = computed(() => props.mode === "update");
const heading = computed(
  () =>
    props.submitLabel ||
    (isUpdate.value ? "Simpan Perubahan" : "Simpan Item Stack"),
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

  if (!form.value.name.trim()) {
    next.name = "Nama item wajib diisi.";
  }

  // Nilai relasi harus merujuk grup yang benar-benar ada.
  if (!form.value.groupId) {
    next.groupId = "Grup harus dipilih.";
  } else if (!groups.value.some((group) => group.id === form.value.groupId)) {
    next.groupId = "Grup stack tidak ditemukan. Muat ulang daftar grup.";
  }

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
const buildCreatePayload = (): StackItemCreateInput => ({
  name: form.value.name.trim(),
  groupId: form.value.groupId,
  order: Number(form.value.order),
});

/**
 * Bangun payload untuk mode update berisi **hanya field yang berubah**.
 *
 * Server mempertahankan semua key yang tidak ada dalam payload, jadi
 * mengirim hanya perbedaan menjaga permintaan tetap minimal.
 * Mengembalikan `null` bila tidak ada perubahan sama sekali.
 */
const buildUpdatePayload = (): StackItemUpdateInput | null => {
  const item = props.initialItem;
  if (!item) return null;

  const payload: StackItemUpdateInput = {};
  const current = form.value;

  if (current.name.trim() !== item.name) {
    payload.name = current.name.trim();
  }

  if (current.groupId !== item.groupId) {
    payload.groupId = current.groupId;
  }

  if (Number(current.order) !== item.order) {
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
    let saved: ApiResponse<StackItemAdmin>;

    if (isUpdate.value) {
      const payload = buildUpdatePayload();

      // Tidak ada yang berubah — jangan kirim permintaan sama sekali.
      if (!payload) {
        setStatus("error", "Tidak ada perubahan untuk disimpan.");
        return;
      }

      saved = await adminPatch<StackItemAdmin>(
        "stack-items",
        props.initialItem?.id ?? "",
        payload,
      );
    } else {
      saved = await adminCreate<StackItemAdmin>(
        "stack-items",
        buildCreatePayload(),
      );
    }

    if (!saved.success || !saved.data) {
      throw new Error(saved.error ?? "Server tidak mengonfirmasi penyimpanan.");
    }

    // Kembalikan form ke keadaan bersih tanpa menyentuh nilai user
    // sebelum server benar-benar mengonfirmasi (mencegah pengiriman ganda).
    form.value = isUpdate.value ? formFromItem(saved.data) : emptyForm();

    setStatus(
      "success",
      isUpdate.value
        ? "Perubahan berhasil disimpan."
        : "Item stack berhasil dibuat.",
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
        <!-- Relasi ke StackGroup -->
        <div>
          <BaseSelect
            v-model="form.groupId"
            title="Grup Stack"
            :options="groupOptions"
            placeholder="Pilih grup stack"
            search-placeholder="Cari grup…"
            required
            :disabled="submitting || groupsLoading"
            :error="errors.groupId"
            @clear-error="clearError('groupId')"
          />

          <!-- Status pemuatan / kegagalan opsi relasi -->
          <div
            v-if="groupsLoading"
            class="mt-1.5 flex items-center gap-2 text-xs text-admin-muted"
            role="status"
          >
            <LoaderCircle class="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Memuat daftar grup…
          </div>

          <div
            v-else-if="groupsError"
            class="mt-1.5 flex items-center gap-2 text-xs text-admin-accent-dark"
            role="alert"
          >
            {{ groupsError }}
            <button
              type="button"
              class="font-bold underline underline-offset-[3px]"
              @click="loadGroups"
            >
              Coba lagi
            </button>
          </div>

          <p v-else-if="!hasGroups" class="mt-1.5 text-xs text-admin-accent-dark">
            Belum ada grup stack. Buat satu pada halaman
            <b>Grup Stack</b> terlebih dahulu.
            <button
              type="button"
              class="ml-1 inline-flex items-center gap-1 font-bold underline underline-offset-[3px]"
              @click="loadGroups"
            >
              <RefreshCw class="h-3 w-3" aria-hidden="true" />
              Muat ulang
            </button>
          </p>

          <p v-else class="mt-1.5 text-xs text-slate-400">
            Item akan tampil di bawah grup yang dipilih pada bagian
            <b class="text-slate-600">Stack</b> di halaman utama.
          </p>
        </div>

        <!-- Nama item -->
        <BaseInput
          v-model="form.name"
          name="name"
          title="Nama Item"
          placeholder="Mis. Vue"
          required
          :disabled="submitting"
          :error="errors.name"
          @clear-error="clearError('name')"
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
          Angka lebih kecil tampil lebih awal di dalam grupnya.
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
          :disabled="submitting || groupsLoading"
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
