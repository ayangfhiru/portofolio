<script setup lang="ts" generic="T extends Record<string, unknown>">
import { LoaderCircle } from "@lucide/vue";
import { computed } from "vue";
import type { DataTableColumn } from "~/types/admin";

/**
 * Tabel data admin yang generik.
 *
 * Tidak mengetahui model apa pun secara spesifik: kolom, urutan sort,
 * dan isi sel semuanya ditentukan lewat props dan scoped slot, sehingga
 * komponen yang sama bisa dipakai untuk project, project-tags, stack,
 * dan model lainnya. Tipe baris diikat lewat generic `T` sehingga isi
 * slot tetap ter-tipe penuh di halaman pemakai.
 *
 * Slot yang tersedia:
 * - `cell-<key>`  — render isi sel khusus, menerima `{ row, value }`.
 *                   Bila tidak disediakan, sel menampilkan `row[key]`.
 * - `actions`     — isi kolom Aksi, menerima `{ row }`.
 * - `empty`       — tampilan alternatif saat tidak ada data.
 * - `empty-actions` — tombol pendukung di bawah pesan kosong.
 *
 * Di layar kecil baris berubah menjadi kartu, mengikuti desain referensi.
 */

interface Props<T> {
  columns: DataTableColumn[];
  rows: T[];
  /** Field yang menjadi pengenal unik tiap baris. */
  rowKey?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  selectable?: boolean;
  /** Baris terpilih — dipakai `v-model` agar induk bisa mengosongkannya. */
  selected?: string[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  minWidth?: string;
}

const props = withDefaults(defineProps<Props<T>>(), {
  rowKey: "id",
  sortKey: "",
  sortDir: "asc",
  selectable: false,
  selected: () => [],
  loading: false,
  emptyTitle: "Data tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian atau filter yang digunakan.",
  minWidth: "940px",
});

const emit = defineEmits<{
  sort: [key: string];
  "update:selected": [ids: string[]];
}>();

/**
 * Tampilan `row` sebagai record agar bisa di-index dengan nama kolom.
 * Satu-satunya type assertion pada komponen ini — `T` hanya dibatasi
 * `object`, sehingga indexing dinamis harus melewati bentuk record.
 */
const asRecord = (row: object): Record<string, unknown> =>
  row as Record<string, unknown>;

const selectedSet = computed(() => new Set(props.selected));

const rowId = (row: object): string => String(asRecord(row)[props.rowKey]);

const isSelected = (row: object): boolean => selectedSet.value.has(rowId(row));

/** Apakah seluruh baris pada tampilan saat ini terpilih? */
const allSelectedOnPage = computed(
  () => props.rows.length > 0 && props.rows.every((row) => isSelected(row)),
);

/** Sebagian baris terpilih — dipakai untuk status "mixed" pada checkbox. */
const someSelectedOnPage = computed(
  () => !allSelectedOnPage.value && props.rows.some((row) => isSelected(row)),
);

/** Nilai sel bila tidak ada slot khusus yang disediakan. */
const cellValue = (row: object, key: string): unknown => asRecord(row)[key];

const toggleRow = (row: object): void => {
  const id = rowId(row);
  const next = new Set(selectedSet.value);

  if (next.has(id)) next.delete(id);
  else next.add(id);

  emit("update:selected", [...next]);
};

/** Pilih/hapus pilihan seluruh baris pada tampilan saat ini. */
const toggleAllOnPage = (): void => {
  const next = new Set(selectedSet.value);

  if (allSelectedOnPage.value) {
    props.rows.forEach((row) => next.delete(rowId(row)));
  } else {
    props.rows.forEach((row) => next.add(rowId(row)));
  }

  emit("update:selected", [...next]);
};

const onSort = (column: DataTableColumn): void => {
  if (column.sortable) emit("sort", column.key);
};

/** Class perataan kolom pada tampilan tabel (desktop). */
const alignClass = (column: DataTableColumn): string =>
  column.align === "right" ? "text-right" : "text-left";
</script>

<template>
  <div>
    <!-- Tabel -->
    <div
      v-if="props.rows.length > 0"
      class="overflow-x-visible md:overflow-x-auto"
    >
      <table
        class="w-full border-collapse md:min-w-[var(--table-min)]"
        :style="{ '--table-min': props.minWidth }"
      >
        <thead class="hidden md:table-header-group">
          <tr>
            <!-- Kolom pilih semua -->
            <th
              v-if="props.selectable"
              style="width: 52px"
              class="whitespace-nowrap bg-admin-head px-4 py-[15px] text-left align-middle"
            >
              <label
                class="relative flex h-[19px] w-[19px] cursor-pointer items-center"
              >
                <input
                  type="checkbox"
                  class="peer sr-only"
                  :checked="allSelectedOnPage"
                  :aria-label="
                    someSelectedOnPage
                      ? 'Sebagian baris terpilih'
                      : 'Pilih semua baris'
                  "
                  @change="toggleAllOnPage"
                />
                <span
                  class="absolute inset-0 rounded-md border-[1.6px] transition-all peer-checked:border-admin-accent peer-checked:bg-admin-accent peer-focus-visible:shadow-[0_0_0_4px_var(--color-admin-accent-soft)]"
                  :class="
                    someSelectedOnPage
                      ? 'border-admin-accent bg-admin-accent'
                      : 'border-admin-line-2 bg-white'
                  "
                >
                  <!-- Tanda centang -->
                  <span
                    v-if="allSelectedOnPage"
                    class="absolute left-[5.5px] top-[2px] h-[9px] w-[5px] rotate-[42deg] border-b-2 border-r-2 border-white"
                    aria-hidden="true"
                  />
                  <!-- Tanda mixed -->
                  <span
                    v-else-if="someSelectedOnPage"
                    class="absolute left-[4px] top-[8px] h-0 w-[9px] border-b-2 border-white"
                    aria-hidden="true"
                  />
                </span>
              </label>
            </th>

            <!-- Header kolom -->
            <th
              v-for="column in props.columns"
              :key="column.key"
              :style="column.width ? { width: column.width } : undefined"
              class="select-none whitespace-nowrap bg-admin-head px-4 py-[15px] font-mono text-[.655rem] font-bold uppercase tracking-[.15em] text-admin-muted-2"
              :class="[
                alignClass(column),
                column.sortable
                  ? 'cursor-pointer transition-colors hover:text-admin-ink'
                  : 'cursor-default',
                column.sortable && props.sortKey === column.key
                  ? 'text-admin-ink'
                  : '',
              ]"
              @click="onSort(column)"
            >
              {{ column.label }}
              <span
                v-if="column.sortable"
                class="ml-1.5 inline-block transition-opacity duration-300"
                :class="
                  props.sortKey === column.key ? 'opacity-100' : 'opacity-0'
                "
                aria-hidden="true"
              >
                <span
                  class="inline-block transition-transform duration-300"
                  :class="
                    props.sortKey === column.key && props.sortDir === 'desc'
                      ? 'rotate-180'
                      : ''
                  "
                >
                  ▲
                </span>
              </span>
            </th>

            <!-- Header aksi -->
            <th
              v-if="$slots.actions"
              class="whitespace-nowrap bg-admin-head px-4 py-[15px] text-right font-mono text-[.655rem] font-bold uppercase tracking-[.15em] text-admin-muted-2"
            >
              Aksi
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in props.rows"
            :key="rowId(row)"
            class="mx-3.5 mb-3.5 block rounded-[14px] border border-admin-line bg-white p-4 transition-colors md:mx-0 md:table-row md:rounded-none md:border-none md:bg-transparent md:p-0"
            :class="
              isSelected(row)
                ? 'border-[#f2c9c5] bg-[#fff7f6] md:bg-[#fff7f6]'
                : 'hover:bg-[#fcfcfd]'
            "
          >
            <!-- Checkbox baris -->
            <td
              v-if="props.selectable"
              class="flex items-center justify-end border-none p-0 md:table-cell md:border-b md:border-solid md:border-admin-line md:p-4"
            >
              <label
                class="relative flex h-[19px] w-[19px] cursor-pointer items-center"
              >
                <input
                  type="checkbox"
                  class="peer sr-only"
                  :checked="isSelected(row)"
                  :aria-label="`Pilih ${String(asRecord(row).title ?? rowId(row))}`"
                  @change="toggleRow(row)"
                />
                <span
                  class="absolute inset-0 rounded-md border-[1.6px] border-admin-line-2 bg-white transition-all peer-checked:border-admin-accent peer-checked:bg-admin-accent peer-focus-visible:shadow-[0_0_0_4px_var(--color-admin-accent-soft)]"
                >
                  <span
                    v-if="isSelected(row)"
                    class="absolute left-[5.5px] top-[2px] h-[9px] w-[5px] rotate-[42deg] border-b-2 border-r-2 border-white"
                    aria-hidden="true"
                  />
                </span>
              </label>
            </td>

            <!-- Sel data -->
            <td
              v-for="column in props.columns"
              :key="column.key"
              :data-label="column.hideLabel ? undefined : column.label"
              class="flex items-center justify-between gap-3.5 border-b border-dashed border-admin-line py-3 text-sm md:table-cell md:justify-normal md:px-4 md:py-[15px] md:align-middle"
              :class="[
                alignClass(column),
                column.hideLabel
                  ? 'md:border-b md:border-solid md:border-admin-line'
                  : 'before:mr-4 before:text-[.645rem] before:font-bold before:uppercase before:tracking-[.13em] before:text-admin-muted-2 before:content-[attr(data-label)] md:before:hidden',
              ]"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="cellValue(row, column.key)"
              >
                {{ cellValue(row, column.key) }}
              </slot>
            </td>

            <!-- Sel aksi -->
            <td
              v-if="$slots.actions"
              class="flex items-center justify-end border-none py-1.5 md:table-cell md:border-b md:border-solid md:border-admin-line md:px-4 md:py-[15px]"
            >
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Keadaan kosong -->
    <div v-else-if="!props.loading" class="px-5 py-16 text-center">
      <slot name="empty">
        <div
          class="mx-auto mb-[18px] grid h-16 w-16 place-items-center rounded-[18px] bg-admin-accent-soft text-admin-accent"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.9"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
        </div>
        <h3 class="font-display text-[1.18rem] tracking-tight">
          {{ props.emptyTitle }}
        </h3>
        <p class="mx-auto mt-2 max-w-md text-sm text-admin-muted">
          {{ props.emptyDescription }}
        </p>
        <slot name="empty-actions" />
      </slot>
    </div>

    <!-- Sedang memuat -->
    <div
      v-else
      class="flex items-center justify-center gap-3 px-5 py-16 text-sm text-admin-muted"
    >
      <LoaderCircle class="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>Memuat data…</span>
    </div>
  </div>
</template>
