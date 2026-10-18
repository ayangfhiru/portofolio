<script setup lang="ts">
/**
 * Halaman kelola data pengalaman (tampilan tabel).
 *
 * Pengalaman memiliki tabel anak `ExperiencePoint` berisi poin
 * pendukung. Poin tidak dikelola lewat halaman tersendiri karena
 * bermakna hanya sebagai bagian dari pengalaman yang menaunginya;
 * ia dikelola lewat pengulang baris pada `ExperienceForm`, dan server
 * menyinkronkan ulang seluruh poin dalam satu transaksi.
 *
 * Mesin daftarnya (muat data, pencarian, pengurutan, paginasi, pilihan,
 * form, hapus) ditangani `useAdminList`, dipakai bersama halaman modul
 * admin lain.
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
  ExperienceForm,
  ModalDialog,
  PaginationBar,
  TableToolbar,
} from "~/components/admin";
import { useAdminList } from "~/composables";
import { adminList, adminRemove, ADMIN_NAV_ITEMS, ADMIN_USER, highlightParts } from "~/utils";
import type { DataTableColumn, ExperienceAdmin } from "~/types";

useHead({ title: "Kelola Pengalaman — Admin" });

const COLUMNS: DataTableColumn[] = [
  { key: "role", label: "Jabatan", sortable: true, hideLabel: true },
  { key: "company", label: "Perusahaan", sortable: true },
  { key: "dateLabel", label: "Periode", sortable: true },
  { key: "points", label: "Poin", align: "right" },
  { key: "order", label: "Urutan", sortable: true, align: "right" },
];

const list = await useAdminList<ExperienceAdmin>({
  resource: "Pengalaman",
  fetchRows: async () => {
    const response = await adminList<ExperienceAdmin>("experiences");

    if (!response.success || !response.data) {
      throw new Error(
        response.error ?? "Server tidak mengembalikan data pengalaman.",
      );
    }

    return response.data;
  },
  columns: COLUMNS,
  searchText: (experience) =>
    [
      experience.role,
      experience.company,
      experience.dateLabel,
      experience.description,
      experience.points.join(" "),
    ].join(" "),
  sortValue: (experience, key) => {
    if (key === "order") return experience.order;
    if (key === "company") return experience.company;
    if (key === "dateLabel") return experience.dateLabel;
    return experience.role;
  },
  rowLabel: (experience) => experience.role,
  defaultSort: { key: "order", dir: "asc" },
  numericSortKeys: ["order"],
  remove: (id) => adminRemove("experiences", id),
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

/** Jumlah poin pada seluruh baris yang sedang dipilih. */
const selectedItemPoints = () =>
  rows.value
    .filter((row) => selected.value.includes(row.id))
    .reduce((total, row) => total + row.points.length, 0);

/** Jumlah poin milik pengalaman yang sedang dituju dialog hapus. */
const targetPointCount = () => deleteTarget.value?.points.length ?? 0;

/** Bagian teks yang cocok dengan pencarian, untuk disorot di tabel. */
const roleParts = (value: string) => highlightParts(value, search.value);

/** Simpan lalu tutup modal, sambil memuat ulang daftar. */
const onSaved = async (experience: ExperienceAdmin): Promise<void> => {
  const verb = formMode.value === "update" ? "diperbarui" : "ditambahkan";

  closeForm();
  list.toast.success(`Pengalaman ${verb}`, `“${experience.role}” tersimpan.`);
  await reload();
};
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <AdminTopbar
      :nav-items="ADMIN_NAV_ITEMS"
      active-key="experience"
      :user="ADMIN_USER"
    />

    <main class="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
      <!-- Kepala halaman -->
      <div class="flex flex-wrap items-end justify-between gap-6 py-9">
        <div class="min-w-0">
          <div class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
            Admin · Pengalaman
          </div>
          <h1 class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.85rem)] font-extrabold leading-[1.04] tracking-tight">
            Data pengalaman <span class="font-bold text-admin-muted-2">/ view table</span>
          </h1>
          <p class="mt-3 max-w-[74ch] text-[.985rem] text-admin-muted">
            Kelola riwayat karier yang tampil pada timeline
            <b class="text-admin-ink">Experience</b> di halaman utama, lengkap dengan
            poin pendukungnya. Poin disimpan sebagai catatan turunan, jadi
            menghapus pengalaman akan ikut menghapus poinnya.
            Data tersimpan melalui
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/admin/experiences</code>.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] bg-admin-accent px-[18px] py-[11px] text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Tambah Pengalaman
        </button>
      </div>

      <!-- Panel tabel -->
      <section class="overflow-hidden rounded-[20px] border border-admin-line bg-admin-card shadow-[0_1px_2px_rgba(16,24,40,.05)]">
        <TableToolbar
          v-model:search="search"
          search-placeholder="Cari jabatan, perusahaan, atau poin…"
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
          empty-description="Belum ada pengalaman terdaftar, atau kata kunci pencarian tidak cocok."
          @sort="onSort"
        >
          <!-- Jabatan -->
          <template #cell-role="{ row }">
            <div class="min-w-[210px]">
              <div class="font-bold leading-snug tracking-tight">
                <template v-for="(part, index) in roleParts(row.role)" :key="index">
                  <mark v-if="part.matched" class="rounded-[3px] bg-[rgba(217,45,32,.16)] px-0.5 text-admin-accent-dark">{{ part.text }}</mark>
                  <template v-else>{{ part.text }}</template>
                </template>
              </div>
              <p class="mt-0.5 max-w-[46ch] text-[.815rem] leading-relaxed text-admin-muted">
                {{ row.description }}
              </p>
            </div>
          </template>

          <!-- Perusahaan -->
          <template #cell-company="{ row }">
            <span class="inline-flex items-center gap-[7px] rounded-lg border border-admin-line bg-admin-bg-2 px-[11px] py-[5px] text-[.795rem] font-semibold text-admin-ink-2">
              <span class="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-admin-info" aria-hidden="true" />
              {{ row.company }}
            </span>
          </template>

          <!-- Periode -->
          <template #cell-dateLabel="{ row }">
            <span class="whitespace-nowrap font-mono text-[.79rem] font-bold text-admin-ink-2">
              {{ row.dateLabel }}
            </span>
          </template>

          <!-- Jumlah poin -->
          <template #cell-points="{ row }">
            <span
              class="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] text-[.735rem] font-bold"
              :class="row.points.length ? 'bg-admin-ok-soft text-admin-ok' : 'bg-admin-bg-2 text-admin-muted'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="row.points.length ? 'bg-admin-ok' : 'bg-admin-muted-2'"
                aria-hidden="true"
              />
              {{ row.points.length }} poin
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
      eyebrow="Admin · Pengalaman"
      :title="formMode === 'create' ? 'Tambah pengalaman baru' : 'Update pengalaman'"
      body-class="p-0"
      @close="closeForm"
    >
      <template #description>
        <template v-if="formMode === 'create'">
          Isi data pengalaman berikut, termasuk poin pendukungnya. Poin
          dibuat dalam transaksi yang sama sehingga tidak pernah tersimpan
          setengah jadi.
        </template>
        <template v-else>
          Perbarui data pengalaman. Hanya field yang berubah yang dikirim
          melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/admin/experiences/:id</code>,
          dan poin ditulis ulang seluruhnya bila daftarnya berubah.
        </template>
      </template>

      <ExperienceForm
        :key="`${formMode}-${editing?.id ?? 'new'}`"
        :mode="formMode"
        :initial-experience="editing"
        cancel-label="Batal"
        @cancel="closeForm"
        @saved="onSaved"
      />
    </ModalDialog>

    <!-- Dialog konfirmasi hapus -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      :loading="deleting"
      :title="bulkDeleteMode ? `Hapus ${selected.length} pengalaman?` : 'Hapus pengalaman ini?'"
      confirm-label="Ya, hapus"
      @confirm="confirmDelete"
      @close="closeDelete"
    >
      <!-- Kalimat penuh lewat slot: konsekuensi hapus-menghapus disebut eksplisit -->
      <template v-if="bulkDeleteMode">
        Sebanyak <b class="font-bold text-admin-ink">{{ selected.length }} pengalaman</b>
        beserta <b class="font-bold text-admin-ink">{{ selectedItemPoints() }} poin</b>
        pendukungnya akan dihapus permanen mengikuti aturan relasi pada skema.
        Tindakan ini tidak dapat dibatalkan.
      </template>
      <template v-else>
        Data <b class="font-bold text-admin-ink">“{{ deleteTarget?.role }}”</b>
        beserta <b class="font-bold text-admin-ink">{{ targetPointCount() }} poin</b>
        pendukungnya akan dihapus permanen melalui
        <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/admin/experiences/:id</code>.
      </template>
    </ConfirmDialog>

    <AppToast />
  </div>
</template>
