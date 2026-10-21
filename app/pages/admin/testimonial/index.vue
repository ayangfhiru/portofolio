<script setup lang="ts">
/**
 * Halaman kelola data testimoni (tampilan tabel).
 *
 * Merangkai komponen panel admin yang bersifat generik — `AdminTopbar`,
 * `TableToolbar`, `DataTable`, `PaginationBar`, `ModalDialog`,
 * `ConfirmDialog` — sementara mesin daftarnya (muat data, pencarian,
 * filter status, pengurutan, paginasi, pilihan, form, hapus) ditangani
 * `useAdminList`, dipakai bersama seluruh halaman modul admin lain.
 *
 * Seluruh data diambil dari `GET /api/admin/testimonials` — berbeda
 * dengan endpoint publik `/api/testimonial`, endpoint admin mengirimkan
 * SEMUA baris (termasuk yang nonaktif) agar admin tetap bisa
 * menyunting testimoni yang sedang disembunyikan.
 */
import { Pencil, Plus, Trash2 } from "@lucide/vue";
import {
  AdminTopbar,
  AppToast,
  ConfirmDialog,
  DataTable,
  ModalDialog,
  PaginationBar,
  TestimonialForm,
  TableToolbar,
} from "~/components/admin";
import { useAdminList } from "~/composables";
import { adminList, adminRemove, ADMIN_NAV_ITEMS, highlightParts } from "~/utils";
import type { DataTableColumn, ToolbarFilter, TestimonialAdmin } from "~/types";

useHead({ title: "Kelola Testimoni — Admin" });

const COLUMNS: DataTableColumn[] = [
  { key: "authorName", label: "Penulis", sortable: true, hideLabel: true },
  { key: "quote", label: "Kutipan", sortable: true },
  { key: "active", label: "Status", sortable: true },
  { key: "order", label: "Urutan", sortable: true, align: "right" },
];

const FILTERS: ToolbarFilter[] = [
  {
    key: "active",
    label: "Status",
    value: "all",
    options: [
      { label: "Semua Status", value: "all" },
      { label: "Aktif", value: "on" },
      { label: "Nonaktif", value: "off" },
    ],
  },
];

const list = await useAdminList<TestimonialAdmin>({
  resource: "Testimoni",
  fetchRows: async () => {
    const response = await adminList<TestimonialAdmin>("testimonials");

    if (!response.success || !response.data) {
      throw new Error(response.error ?? "Server tidak mengembalikan data testimoni.");
    }

    return response.data;
  },
  columns: COLUMNS,
  filters: FILTERS,
  passesFilter: (testimonial, values) => {
    const status = values.active ?? "all";
    if (status === "on" && !testimonial.active) return false;
    if (status === "off" && testimonial.active) return false;
    return true;
  },
  searchText: (testimonial) =>
    `${testimonial.quote} ${testimonial.authorName} ${testimonial.authorRole}`,
  sortValue: (testimonial, key) => {
    if (key === "order") return testimonial.order;
    if (key === "active") return testimonial.active ? 1 : 0;
    if (key === "quote") return testimonial.quote;
    return testimonial.authorName;
  },
  rowLabel: (testimonial) => testimonial.authorName,
  defaultSort: { key: "order", dir: "asc" },
  numericSortKeys: ["order", "active"],
  remove: (id) => adminRemove("testimonials", id),
});

const {
  rows,
  loading,
  loadError,
  reload,
  search,
  page,
  perPage,
  filters,
  onFilterChange,
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

/** Bagian teks nama penulis yang cocok dengan pencarian, untuk disorot. */
const nameParts = (value: string) => highlightParts(value, search.value);

/** Simpan lalu tutup modal, sambil memuat ulang daftar. */
const onSaved = async (testimonial: TestimonialAdmin): Promise<void> => {
  const verb = formMode.value === "update" ? "diperbarui" : "ditambahkan";

  closeForm();
  list.toast.success(`Testimoni ${verb}`, `“${testimonial.authorName}” tersimpan.`);
  await reload();
};
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <AdminTopbar
      :nav-items="ADMIN_NAV_ITEMS"
      active-key="testimonial"
    />

    <main class="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
      <!-- Kepala halaman -->
      <div class="flex flex-wrap items-end justify-between gap-6 py-9">
        <div class="min-w-0">
          <div class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
            Admin · Testimoni
          </div>
          <h1 class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.85rem)] font-extrabold leading-[1.04] tracking-tight">
            Data testimoni <span class="font-bold text-admin-muted-2">/ view table</span>
          </h1>
          <p class="mt-3 max-w-[74ch] text-[.985rem] text-admin-muted">
            Kelola seluruh testimoni yang tampil pada bagian
            <b class="text-admin-ink">Quote</b> di halaman utama. Data tersimpan melalui
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/admin/testimonials</code>,
            diperbarui via
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/admin/testimonials/:id</code>,
            dan dihapus via
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/admin/testimonials/:id</code>.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] bg-admin-accent px-[18px] py-[11px] text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Tambah Testimoni
        </button>
      </div>

      <!-- Panel tabel -->
      <section class="overflow-hidden rounded-[20px] border border-admin-line bg-admin-card shadow-[0_1px_2px_rgba(16,24,40,.05)]">
        <TableToolbar
          v-model:search="search"
          search-placeholder="Cari kutipan, nama, atau jabatan…"
          :filters="filters"
          @filter-change="onFilterChange"
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
          empty-description="Belum ada testimoni terdaftar, atau kata kunci pencarian tidak cocok."
          @sort="onSort"
        >
          <!-- Nama penulis + jabatan -->
          <template #cell-authorName="{ row }">
            <div class="min-w-[190px]">
              <div class="font-bold leading-snug tracking-tight">
                <template v-for="(part, index) in nameParts(row.authorName)" :key="index">
                  <mark v-if="part.matched" class="rounded-[3px] bg-[rgba(217,45,32,.16)] px-0.5 text-admin-accent-dark">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </div>
              <div class="mt-0.5 text-[.78rem] text-admin-muted-2">{{ row.authorRole }}</div>
            </div>
          </template>

          <!-- Kutipan -->
          <template #cell-quote="{ row }">
            <p class="min-w-[280px] max-w-[58ch] text-[.87rem] leading-relaxed text-admin-muted">
              {{ row.quote }}
            </p>
          </template>

          <!-- Status aktif -->
          <template #cell-active="{ row }">
            <span
              class="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] text-[.735rem] font-bold"
              :class="row.active ? 'bg-admin-ok-soft text-admin-ok' : 'bg-admin-bg-2 text-admin-muted'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="row.active ? 'bg-admin-ok' : 'bg-admin-muted-2'"
                aria-hidden="true"
              />
              {{ row.active ? "Aktif" : "Nonaktif" }}
            </span>
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
      eyebrow="Admin · Testimoni"
      :title="formMode === 'create' ? 'Tambah testimoni baru' : 'Update testimoni'"
      body-class="p-0"
      @close="closeForm"
    >
      <template #description>
        <template v-if="formMode === 'create'">
          Isi data testimoni berikut. Data tersimpan melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/admin/testimonials</code>
          dan tampil pada bagian Quote di halaman utama.
        </template>
        <template v-else>
          Perbarui data testimoni. Hanya field yang berubah yang dikirim melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/admin/testimonials/:id</code>.
        </template>
      </template>

      <TestimonialForm
        :key="`${formMode}-${editing?.id ?? 'new'}`"
        :mode="formMode"
        :initial-testimonial="editing"
        cancel-label="Batal"
        @cancel="closeForm"
        @saved="onSaved"
      />
    </ModalDialog>

    <!-- Dialog konfirmasi hapus -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      :loading="deleting"
      :title="bulkDeleteMode ? `Hapus ${selected.length} testimoni?` : 'Hapus testimoni ini?'"
      confirm-label="Ya, hapus"
      @confirm="confirmDelete"
      @close="closeDelete"
    >
      <!-- Kalimat penuh lewat slot: label sasaran saja tidak merangkai kalimat utuh -->
      <template v-if="bulkDeleteMode">
        Sebanyak <b class="font-bold text-admin-ink">{{ selected.length }} testimoni</b>
        akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
      </template>
      <template v-else>
        Data <b class="font-bold text-admin-ink">“{{ deleteTarget?.authorName }}”</b>
        akan dihapus permanen melalui
        <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/admin/testimonials/:id</code>.
      </template>
    </ConfirmDialog>

    <AppToast />
  </div>
</template>
