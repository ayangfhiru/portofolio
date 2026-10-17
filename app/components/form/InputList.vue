<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus, Trash2 } from "@lucide/vue";

/**
 * Editor daftar baris teks — untuk field berbentuk kolom `String[]`.
 *
 * Setiap baris mewakili satu entri. Pengguna menambah baris lewat tombol
 * dan menghapusnya lewat ikon tempat sampah, sehingga nilai yang dikirim
 * ke server selalu berupa array teks yang sudah rapi.
 *
 * Pembaruan selalu mengirim array BARU melalui `defineModel` — array milik
 * induk tidak pernah dimodifikasi langsung, sehingga keterikatan datanya
 * tetap eksplisit dan dapat dipantau oleh Vue.
 *
 * Input tiap baris memakai `aria-label` bernomor (bukan `<label>` terpisah)
 * karena label yang terulang per baris hanya menambah kebisingan visual.
 */
interface Props {
  /** Label kelompok, mis. "Poin Pendukung". */
  title: string;
  /** Nama entri untuk placeholder & label aksesibel, mis. "Poin". */
  itemPrefix: string;
  /** Label tombol tambah. */
  addLabel?: string;
  /** Keterangan saat daftar masih kosong. */
  emptyHint?: string;
  error?: string;
  disabled?: boolean;
  placeholderPrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  addLabel: "Tambah Item",
  emptyHint: "",
  placeholderPrefix: "",
  disabled: false,
});

const emit = defineEmits<{
  /** Dibersihkan begitu pengguna mulai mengetik pada baris mana pun. */
  "clear-error": [];
}>();

const model = defineModel<string[]>({ default: () => [] });

/**
 * Salinan lokal daftar.
 *
 * `defineModel` membaca nilai dari prop induk yang baru tersinkron pada
 * render berikutnya. Tanpa salinan lokal, dua kali klik "Tambah" dalam
 * satu tick akan membaca nilai yang sama sehingga satu baris hilang.
 * Salinan lokal diperbarui seketika, lalu dikirim ke induk.
 */
const rows = ref<string[]>([...props.modelValue]);

// Ikuti perubahan dari luar, mis. form yang direset saat ganti mode.
watch(
  () => props.modelValue,
  (value) => {
    rows.value = [...value];
  },
);

/** Terapkan baris baru ke salinan lokal sekaligus kirim ke induk. */
const commit = (next: string[]): void => {
  rows.value = next;
  model.value = [...next];
};

/** Tambah satu baris kosong di akhir daftar. */
const addItem = (): void => {
  commit([...rows.value, ""]);
  emit("clear-error");
};

/** Hapus satu baris berdasarkan indeksnya. */
const removeItem = (index: number): void => {
  commit(rows.value.filter((_, position) => position !== index));
  emit("clear-error");
};

/** Timpa isi satu baris tanpa menyentuh baris lainnya. */
const handleInput = (index: number, event: Event): void => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  commit(
    rows.value.map((item, position) =>
      position === index ? target.value : item,
    ),
  );
  emit("clear-error");
};
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-3">
      <label class="block text-sm font-medium text-slate-700">
        {{ props.title }}
      </label>

      <button
        type="button"
        class="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-admin-line-2 bg-white px-3 py-1.5 text-[.79rem] font-bold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="props.disabled"
        @click="addItem"
      >
        <Plus class="h-3.5 w-3.5" aria-hidden="true" />
        {{ props.addLabel }}
      </button>
    </div>

    <p v-if="rows.length === 0" class="text-xs text-slate-400">
      {{ props.emptyHint }}
    </p>

    <ul v-else class="grid gap-2">
      <li
        v-for="(_, index) in rows"
        :key="index"
        class="flex items-start gap-2"
      >
        <input
          :id="`input-list-${index}`"
          type="text"
          :value="rows[index]"
          :name="`${props.itemPrefix}[${index}]`"
          :placeholder="
            props.placeholderPrefix
              ? `${props.placeholderPrefix} ${index + 1}`
              : `${props.itemPrefix} ${index + 1}`
          "
          :disabled="props.disabled"
          :aria-label="`${props.itemPrefix} ke-${index + 1}`"
          :aria-invalid="!!props.error"
          class="w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
          :class="
            props.error
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-200 hover:border-slate-300 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10'
          "
          @input="handleInput(index, $event)"
        />

        <button
          type="button"
          class="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f2c9c5] bg-white text-admin-accent transition hover:-translate-y-0.5 hover:bg-admin-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="props.disabled"
          :aria-label="`Hapus ${props.itemPrefix.toLowerCase()} ke-${index + 1}`"
          @click="removeItem(index)"
        >
          <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <p v-if="props.error" role="alert" class="mt-1.5 text-sm text-red-500">
      {{ props.error }}
    </p>
  </div>
</template>
