<script setup lang="ts">
import { Search, X } from "@lucide/vue";
import type { ToolbarFilter } from "~/types";

/**
 * Toolbar di atas tabel: pencarian, filter dropdown, dan slot tombol aksi.
 *
 * `search` memakai `v-model`, sedangkan setiap filter memakai event
 * `filter-change` dengan kunci masing-masing — sehingga induk memegang
 * seluruh state dan komponen ini tetap tanpa state sendiri.
 */

interface Props {
  search?: string;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
}

const props = withDefaults(defineProps<Props>(), {
  search: "",
  searchPlaceholder: "Cari…",
  filters: () => [],
});

const emit = defineEmits<{
  "update:search": [value: string];
  "filter-change": [key: string, value: string];
}>();

/** Bersihkan pencarian tanpa perlu mengarahkan fokus ke input lain. */
const clearSearch = (): void => {
  emit("update:search", "");
};

const onFilterChange = (key: string, event: Event): void => {
  const target = event.target as HTMLSelectElement;
  emit("filter-change", key, target.value);
};
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-admin-line p-5">
    <!-- Pencarian -->
    <div class="relative min-w-[260px] flex-1 basis-80">
      <Search
        class="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-admin-muted-2"
        aria-hidden="true"
      />
      <input
        :value="props.search"
        type="text"
        :placeholder="props.searchPlaceholder"
        autocomplete="off"
        class="w-full rounded-[11px] border border-admin-line-2 bg-white py-3 pl-10 pr-11 text-[.915rem] outline-none transition placeholder:text-admin-muted-2 focus:border-admin-accent focus:shadow-[0_0_0_4px_var(--color-admin-accent-soft)]"
        @input="
          emit('update:search', ($event.target as HTMLInputElement).value)
        "
      />
      <button
        v-if="props.search"
        type="button"
        aria-label="Bersihkan pencarian"
        class="absolute right-[11px] top-1/2 grid h-[26px] w-[26px] -translate-y-1/2 place-items-center rounded-lg border border-admin-line-2 bg-white text-admin-muted transition-colors hover:border-admin-accent hover:text-admin-accent"
        @click="clearSearch"
      >
        <X class="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>

    <!-- Filter -->
    <div v-for="filter in props.filters" :key="filter.key" class="relative">
      <select
        :value="filter.value"
        :aria-label="filter.label"
        class="cursor-pointer appearance-none rounded-[11px] border border-admin-line-2 bg-white py-[11px] pl-3.5 pr-9 text-[.855rem] font-semibold text-admin-ink-2 outline-none transition focus:border-admin-accent focus:shadow-[0_0_0_4px_var(--color-admin-accent-soft)]"
        @change="onFilterChange(filter.key, $event)"
      >
        <option
          v-for="option in filter.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <span
        class="pointer-events-none absolute right-[15px] top-1/2 h-[7px] w-[7px] -translate-y-[70%] rotate-45 border-b-[1.8px] border-r-[1.8px] border-admin-muted"
        aria-hidden="true"
      />
    </div>

    <!-- Aksi -->
    <div v-if="$slots.actions" class="ml-auto flex gap-2.5">
      <slot name="actions" />
    </div>
  </div>
</template>
