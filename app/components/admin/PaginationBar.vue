<script setup lang="ts">
import { computed } from "vue";

/**
 * Baris kaki tabel: rentang data, pemilih jumlah baris per halaman,
 * dan tombol navigasi halaman dengan elipsis.
 *
 * Halaman dan jumlah baris per halaman dikendalikan lewat `v-model`
 * sehingga induk bebas memilih memuat data di klien atau di server.
 */

interface Props {
  page: number;
  perPage: number;
  total: number;
  perPageOptions?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  perPageOptions: () => [5, 8, 12, 20],
});

const emit = defineEmits<{
  "update:page": [value: number];
  "update:perPage": [value: number];
}>();

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)));

/** "1–8" dari "1–8 dari 24 data". */
const rangeLabel = computed(() => {
  if (props.total === 0) return "0–0";
  const start = (props.page - 1) * props.perPage + 1;
  const end = Math.min(props.page * props.perPage, props.total);
  return `${start}–${end}`;
});

/**
 * Susunan nomor halaman dengan elipsis, mis. `1 … 4 5 6 … 20`.
 * Hanya nomor yang dekat dengan halaman aktif, plus halaman pertama
 * dan terakhir, yang ditampilkan.
 */
const pageItems = computed<Array<number | "ellipsis">>(() => {
  const current = props.page;
  const last = totalPages.value;
  const items: Array<number | "ellipsis"> = [];

  for (let index = 1; index <= last; index++) {
    const isEdge = index === 1 || index === last;
    const isNear = Math.abs(index - current) <= 1;

    if (isEdge || isNear) {
      items.push(index);
    } else if (items[items.length - 1] !== "ellipsis") {
      items.push("ellipsis");
    }
  }

  return items;
});

const goTo = (page: number): void => {
  if (page < 1 || page > totalPages.value || page === props.page) return;
  emit("update:page", page);
};

const onPerPageChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement;
  emit("update:perPage", Number(target.value));
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-3.5 border-t border-admin-line bg-admin-head px-5 py-4">
    <div class="text-[.835rem] text-admin-muted">
      Menampilkan <b class="font-mono text-[.815rem] text-admin-ink">{{ rangeLabel }}</b>
      dari <b class="font-mono text-[.815rem] text-admin-ink">{{ props.total }}</b> data
    </div>

    <!-- Jumlah baris per halaman -->
    <div class="relative">
      <select
        :value="props.perPage"
        aria-label="Jumlah baris per halaman"
        class="cursor-pointer appearance-none rounded-[11px] border border-admin-line-2 bg-white py-[9px] pl-3.5 pr-9 text-[.855rem] font-semibold text-admin-ink-2 outline-none transition focus:border-admin-accent focus:shadow-[0_0_0_4px_var(--color-admin-accent-soft)]"
        @change="onPerPageChange"
      >
        <option v-for="option in props.perPageOptions" :key="option" :value="option">
          {{ option }} / halaman
        </option>
      </select>
      <span
        class="pointer-events-none absolute right-[15px] top-1/2 h-[7px] w-[7px] -translate-y-[70%] rotate-45 border-b-[1.8px] border-r-[1.8px] border-admin-muted"
        aria-hidden="true"
      />
    </div>

    <!-- Navigasi halaman -->
    <nav class="ml-auto flex flex-wrap items-center gap-1.5" aria-label="Navigasi halaman">
      <button
        type="button"
        aria-label="Halaman sebelumnya"
        class="grid h-9 min-w-9 place-items-center rounded-[9px] border border-admin-line-2 bg-white px-2.5 font-mono text-sm font-semibold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        :disabled="props.page <= 1"
        @click="goTo(props.page - 1)"
      >
        ‹
      </button>

      <template v-for="(item, index) in pageItems" :key="`${item}-${index}`">
        <span v-if="item === 'ellipsis'" class="grid h-9 min-w-9 place-items-center px-1 font-mono text-sm text-admin-muted-2" aria-hidden="true">
          …
        </span>
        <button
          v-else
          type="button"
          :aria-current="item === props.page ? 'page' : undefined"
          class="grid h-9 min-w-9 place-items-center rounded-[9px] border px-2.5 font-mono text-sm font-semibold transition hover:-translate-y-0.5"
          :class="
            item === props.page
              ? 'border-admin-ink bg-admin-ink text-white'
              : 'border-admin-line-2 bg-white text-admin-ink-2 hover:border-admin-ink'
          "
          @click="goTo(item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        aria-label="Halaman berikutnya"
        class="grid h-9 min-w-9 place-items-center rounded-[9px] border border-admin-line-2 bg-white px-2.5 font-mono text-sm font-semibold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        :disabled="props.page >= totalPages"
        @click="goTo(props.page + 1)"
      >
        ›
      </button>
    </nav>
  </div>
</template>
