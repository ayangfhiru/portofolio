<script setup lang="ts">
/**
 * Halaman kelola data statistik hero (tampilan tabel).
 *
 * Merangkai komponen panel admin yang bersifat generik — `AdminTopbar`,
 * `TableToolbar`, `DataTable`, `PaginationBar`, `ModalDialog`,
 * `ConfirmDialog` — sementara mesin daftarnya (muat data, pencarian,
 * pengurutan, paginasi, pilihan, form, hapus) ditangani `useAdminList`.
 *
 * Seluruh data diambil dari `GET /api/admin/stats` lalu diproses di
 * sisi klien karena volumenya kecil. Bila kelak data membesar, cukup
 * ganti sumber `pageRows` menjadi hasil server tanpa mengubah komponen
 * tampilan.
 *
 * Halaman master data sengaja tidak memakai `StatStrip`: statistik
 * ringkas tidak membantu pengelolaan data harian.
 */
import { Pencil, Plus, Trash2 } from "@lucide/vue";
import {
  AdminTopbar,
  AppToast,
  ConfirmDialog,
  DataTable,
  ModalDialog,
  PaginationBar,
  StatForm,
  TableToolbar,
} from "~/components/admin";
import { useAdminList } from "~/composables/useAdminList";
import { adminList, adminRemove } from "~/utils/admin-api";
import { ADMIN_NAV_ITEMS, ADMIN_USER } from "~/utils/admin-nav";
import { highlightParts } from "~/utils/format";
import type { DataTableColumn } from "~/types/admin";
import type { StatAdmin } from "~/types/stat";

useHead({ title: "Kelola Statistik — Admin" });

const COLUMNS: DataTableColumn[] = [
  { key: "label", label: "Nama Statistik", sortable: true, hideLabel: true },
  { key: "value", label: "Nilai", sortable: true },
  { key: "suffix", label: "Suffix", sortable: true },
  { key: "order", label: "Urutan", sortable: true, align: "right" },
];

const list = await useAdminList<StatAdmin>({
  resource: "Statistik",
  fetchRows: async () => {
    const response = await adminList<StatAdmin>("stats");

    if (!response.success || !response.data) {
      throw new Error(response.error ?? "Server tidak mengembalikan data statistik.");
    }

    return response.data;
  },
  columns: COLUMNS,
  searchText: (stat) => `${stat.label} ${stat.suffix}`,
  sortValue: (stat, key) => {
    if (key === "order") return stat.order;
    if (key === "value") return stat.value;
    if (key === "suffix") return stat.suffix;
    return stat.label;
  },
  rowLabel: (stat) => stat.label,
  defaultSort: { key: "order", dir: "asc" },
  numericSortKeys: ["value", "order"],
  remove: (id) => adminRemove("stats", id),
});

const {
  rows,
  loading,
  loadError,
  reload,
  search,
  page,
  perPage,
  resetFilters,
  sort,
  sortedRows,
  onSort,
  pageRows,
  selected,
  hasSelection,
  formOpen,
  formMode,
  editing,
  openCreate,
  openEdit,
  closeForm,
  deleteTarget,
  deleteDialogOpen,
  deleting,
  bulkDeleteMode,
  askDelete,
  askBulkDelete,
  closeDelete,
  confirmDelete,
} = list;

/** Bagian teks yang cocok dengan pencarian, untuk disorot di tabel. */
const labelParts = (value: string) => highlightParts(value, search.value);

/** Simpan lalu tutup modal, sambil memuat ulang daftar. */
const onSaved = async (stat: StatAdmin): Promise<void> => {
  const verb = formMode.value === "update" ? "diperbarui" : "ditambahkan";

  closeForm();
  list.toast.success(`Statistik ${verb}`, `“${stat.label}” tersimpan.`);
  await reload();
};
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <AdminTopbar
      :nav-items="ADMIN_NAV_ITEMS"
      active-key="stat"
      :user="ADMIN_USER"
    />

    <main class="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
      <!-- Kepala halaman -->
      <div class="flex flex-wrap items-end justify-between gap-6 py-9">
        <div class="min-w-0">
          <div class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
            Admin · Statistik
          </div>
          <h1 class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.85rem)] font-extrabold leading-[1.04] tracking-tight">
            Data statistik <span class="font-bold text-admin-muted-2">/ view table</span>
          </h1>
          <p class="mt-3 max-w-[74ch] text-[.985rem] text-admin-muted">
            Kelola seluruh statistik counter yang tampil pada bagian
            <b class="text-admin-ink">Hero</b> di halaman utama. Data tersimpan melalui
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/admin/stats</code>,
            diperbarui via
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/admin/stats/:id</code>,
            dan dihapus via
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/admin/stats/:id</code>.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] bg-admin-accent px-[18px] py-[11px] text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Tambah Statistik
        </button>
      </div>

      <!-- Panel tabel -->
      <section class="overflow-hidden rounded-[20px] border border-admin-line bg-admin-card shadow-[0_1px_2px_rgba(16,24,40,.05)]">
        <TableToolbar
          v-model:search="search"
          search-placeholder="Cari nama atau suffix statistik…"
        >
          <template #actions>
            <button
              v-if="hasSelection"
              type="button"
              class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] border border-[#f2c9c5] bg-white px-[18px] py-[11px] text-sm font-bold text-admin-accent transition hover:-translate-y-0.5 hover:bg-admin-accent hover:text-white"
              @click="askBulkDelete"
            >
              <Trash2 class="h-4 w-4" aria-hidden="true" />
              Hapus Terpilih ({{ selected.length }})
            </button>
          </template>
        </TableToolbar>

        <!-- Bilah pilihan massal -->
        <Transition
          enter-active-class="transition-all duration-300"
          leave-active-class="transition-all duration-300"
          enter-from-class="max-h-0 opacity-0"
          leave-to-class="max-h-0 opacity-0"
        >
          <div
            v-if="hasSelection"
            class="flex flex-wrap items-center gap-3 border-b border-[#f6d4d1] bg-admin-accent-soft px-5 py-3 text-sm font-semibold text-admin-accent-dark"
          >
            <span class="rounded-full bg-admin-accent px-2.5 py-[3px] font-mono text-[.78rem] font-bold text-white">
              {{ selected.length }}
            </span>
            <span>baris dipilih</span>
            <button
              type="button"
              class="ml-2 text-[.82rem] font-bold text-admin-accent-dark underline underline-offset-[3px] transition hover:text-admin-accent"
              @click="selected = []"
            >
              Bersihkan pilihan
            </button>
          </div>
        </Transition>

        <!-- Error memuat -->
        <div
          v-if="loadError"
          role="alert"
          class="border-b border-[#f2c9c5] bg-admin-accent-soft px-5 py-4 text-sm font-semibold text-admin-accent-dark"
        >
          {{ loadError }}
          <button
            type="button"
            class="ml-2 underline underline-offset-[3px]"
            @click="reload"
          >
            Coba lagi
          </button>
        </div>

        <DataTable
          v-model:selected="selected"
          :columns="COLUMNS"
          :rows="pageRows"
          :loading="loading"
          :selectable="true"
          :sort-key="sort.key"
          :sort-dir="sort.dir"
          row-key="id"
          empty-title="Data tidak ditemukan"
          empty-description="Belum ada statistik terdaftar, atau kata kunci pencarian tidak cocok."
          @sort="onSort"
        >
          <!-- Nama statistik -->
          <template #cell-label="{ row }">
            <div class="min-w-[190px] font-bold leading-snug tracking-tight">
              <template v-for="(part, index) in labelParts(row.label)" :key="index">
                <mark v-if="part.matched" class="rounded-[3px] bg-[rgba(217,45,32,.16)] px-0.5 text-admin-accent-dark">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </div>
          </template>

          <!-- Nilai -->
          <template #cell-value="{ row }">
            <span class="font-mono text-[.87rem] font-bold text-admin-ink">{{ row.value }}</span>
          </template>

          <!-- Suffix -->
          <template #cell-suffix="{ row }">
            <span class="font-mono text-[.87rem] text-admin-muted">{{ row.suffix }}</span>
          </template>

          <!-- Urutan -->
          <template #cell-order="{ row }">
            <span class="font-mono text-[.83rem] font-bold text-admin-ink-2">{{ row.order }}</span>
          </template>

          <!-- Aksi -->
          <template #actions="{ row }">
            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="inline-flex min-h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-lg border border-admin-line-2 bg-white px-[13px] py-[7px] text-[.79rem] font-bold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink hover:text-admin-ink"
                @click="openEdit(row)"
              >
                <Pencil class="h-3.5 w-3.5" aria-hidden="true" />
                Update
              </button>
              <button
                type="button"
                class="inline-flex min-h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-lg border border-[#f2c9c5] bg-white px-[13px] py-[7px] text-[.79rem] font-bold text-admin-accent transition hover:-translate-y-0.5 hover:bg-admin-accent hover:text-white"
                @click="askDelete(row)"
              >
                <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </template>

          <template #empty-actions>
            <button
              type="button"
              class="mt-[18px] inline-flex min-h-11 items-center justify-center gap-2 rounded-[11px] border border-admin-line-2 bg-white px-[18px] py-[11px] text-sm font-bold text-admin-ink-2 transition hover:-translate-y-0.5 hover:border-admin-ink hover:text-admin-ink"
              @click="resetFilters"
            >
              Reset filter & pencarian
            </button>
          </template>
        </DataTable>

        <PaginationBar
          v-model:page="page"
          v-model:per-page="perPage"
          :total="sortedRows.length"
        />
      </section>
    </main>

    <!-- Modal tambah / ubah -->
    <ModalDialog
      :open="formOpen"
      eyebrow="Admin · Statistik"
      :title="formMode === 'create' ? 'Tambah statistik baru' : 'Update statistik'"
      body-class="p-0"
      @close="closeForm"
    >
      <template #description>
        <template v-if="formMode === 'create'">
          Isi data statistik berikut. Data tersimpan melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/admin/stats</code>
          dan tampil pada bagian Hero di halaman utama.
        </template>
        <template v-else>
          Perbarui data statistik. Hanya field yang berubah yang dikirim melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/admin/stats/:id</code>.
        </template>
      </template>

      <StatForm
        :key="`${formMode}-${editing?.id ?? 'new'}`"
        :mode="formMode"
        :initial-stat="editing"
        cancel-label="Batal"
        @cancel="closeForm"
        @saved="onSaved"
      />
    </ModalDialog>

    <!-- Dialog konfirmasi hapus -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      :loading="deleting"
      :title="bulkDeleteMode ? `Hapus ${selected.length} statistik?` : 'Hapus statistik ini?'"
      confirm-label="Ya, hapus"
      @confirm="confirmDelete"
      @close="closeDelete"
    >
      <!-- Kalimat penuh lewat slot: label sasaran saja tidak merangkai kalimat utuh -->
      <template v-if="bulkDeleteMode">
        Sebanyak <b class="font-bold text-admin-ink">{{ selected.length }} statistik</b>
        akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
      </template>
      <template v-else>
        Data <b class="font-bold text-admin-ink">“{{ deleteTarget?.label }}”</b>
        akan dihapus permanen melalui
        <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/admin/stats/:id</code>.
      </template>
    </ConfirmDialog>

    <AppToast />
  </div>
</template>
