import { computed, ref, watch } from "vue";
import { extractApiError } from "~/utils/admin-api";
import type { ApiResponse } from "~/types/api";
import type { DataTableColumn, ToolbarFilter } from "~/types/admin";

/**
 * Mesin status bersama untuk seluruh halaman daftar admin.
 *
 * Halaman daftar di setiap modul memiliki kebutuhan identik: memuat data,
 * mencari, menyaring, mengurutkan, memilih baris, membuka form tambah/ubah,
 * dan mengonfirmasi penghapusan. Menyalinnya ke sepuluh halaman akan
 * menghasilkan ribuan baris yang rawan menyimpang, jadi bagian tersebut
 * dikumpulkan di sini.
 *
 * Yang TIDAK dicomposable adalah tampilan dan form — keduanya tetap
 * ditulis eksplisit di tiap halaman karena bentuknya benar-benar berbeda
 * per model. Composable ini hanya mengembalikan state dan handler.
 */

/** Status pengurutan aktif pada tabel. */
export interface AdminSortState {
  key: string;
  dir: "asc" | "desc";
}

/** Konfigurasi satu halaman daftar admin. */
export interface AdminListOptions<T extends { id: string }> {
  /** Nama tampilan resource, mis. `"Service"` — dipakai pada pesan toast. */
  resource: string;
  /** Ambil seluruh baris dari API. */
  fetchRows: () => Promise<T[]>;
  /** Definisi kolom tabel. */
  columns: DataTableColumn[];
  /** Teks gabungan dari satu baris untuk pencarian umum. */
  searchText: (row: T) => string;
  /** Nilai pembanding pengurutan — angka untuk kolom numerik. */
  sortValue: (row: T, key: string) => string | number;
  /** Nama tampilan baris, dipakai pada dialog konfirmasi hapus. */
  rowLabel: (row: T) => string;
  /** Urutan awal tabel. Bila dilewatkan, mengikuti urutan dari API. */
  defaultSort?: AdminSortState;
  /** Definisi filter toolbar (opsional). */
  filters?: ToolbarFilter[];
  /**
   * Kolom yang urutannya dibuka menurun saat pertama diklik (angka,
   * tanggal, boolean) — kolom teks terbuka menaik.
   */
  numericSortKeys?: string[];
  /** Uji satu baris terhadap nilai filter aktif. */
  passesFilter?: (row: T, values: Record<string, string>) => boolean;
  /** Hapus satu baris melalui API. */
  remove: (id: string) => Promise<ApiResponse<{ id: string }>>;
  /** Jumlah baris per halaman awal. */
  initialPerPage?: number;
}

/**
 * Kembalikan objek state dan handler ke halaman pemanggil.
 *
 * Bersifat `async` karena memuat data secara blocking: halaman memanggil
 * `await useAdminList(...)` di `<script setup>` sehingga SSR sudah
 * merender baris sungguhan, bukan kerangka loading.
 */
export const useAdminList = async <T extends { id: string }>(
  options: AdminListOptions<T>,
) => {
  /* ----------------------------------------------------------- Data */

  const rows = ref<T[]>([]);
  const loading = ref(true);
  const loadError = ref<string | null>(null);

  /** Ambil ulang seluruh baris dari API. */
  const reload = async (): Promise<void> => {
    loading.value = true;
    loadError.value = null;

    try {
      rows.value = await options.fetchRows();
    } catch (error) {
      rows.value = [];
      loadError.value = extractApiError(
        error,
        `Gagal memuat data ${options.resource.toLowerCase()}.`,
      ).message;
    } finally {
      loading.value = false;
    }
  };

  await reload();

  /* --------------------------------------------- Pencarian & filter */

  const search = ref("");
  const page = ref(1);
  const perPage = ref(options.initialPerPage ?? 8);

  const filters = ref<ToolbarFilter[]>(options.filters ?? []);

  const filterValue = (key: string): string =>
    filters.value.find((filter) => filter.key === key)?.value ?? "all";

  const onFilterChange = (key: string, value: string): void => {
    filters.value = filters.value.map((filter) =>
      filter.key === key ? { ...filter, value } : filter,
    );
    page.value = 1;
  };

  const filteredRows = computed(() => {
    const query = search.value.trim().toLowerCase();
    const values = Object.fromEntries(
      filters.value.map((filter) => [filter.key, filter.value]),
    );

    return rows.value.filter((row) => {
      if (query && !options.searchText(row).toLowerCase().includes(query)) {
        return false;
      }

      return options.passesFilter?.(row, values) ?? true;
    });
  });

  // Kembali ke halaman pertama tiap pencarian berubah.
  watch(search, () => {
    page.value = 1;
  });

  /* ------------------------------------------------------ Pengurutan */

  const sort = ref<AdminSortState>(
    options.defaultSort ?? { key: "", dir: "asc" },
  );

  const sortedRows = computed(() => {
    const { key, dir } = sort.value;

    // Tanpa kolom urutan aktif, pertahankan urutan dari API.
    if (!key) return filteredRows.value;

    const factor = dir === "asc" ? 1 : -1;

    return [...filteredRows.value].sort((a, b) => {
      const left = options.sortValue(a, key);
      const right = options.sortValue(b, key);

      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * factor;
      }

      return String(left).localeCompare(String(right)) * factor;
    });
  });

  const onSort = (key: string): void => {
    if (sort.value.key === key) {
      sort.value = { key, dir: sort.value.dir === "asc" ? "desc" : "asc" };
      return;
    }

    const numeric = (options.numericSortKeys ?? []).includes(key);
    sort.value = { key, dir: numeric ? "desc" : "asc" };
  };

  /* -------------------------------------------------------- Paginasi */

  const pageRows = computed(() => {
    const start = (page.value - 1) * perPage.value;
    return sortedRows.value.slice(start, start + perPage.value);
  });

  /* -------------------------------------------------------- Pilihan */

  const selected = ref<string[]>([]);
  const hasSelection = computed(() => selected.value.length > 0);

  /* --------------------------------------------------------- Form */

  const formOpen = ref(false);
  const formMode = ref<"create" | "update">("create");
  const editing = ref<T | null>(null);

  const openCreate = (): void => {
    formMode.value = "create";
    editing.value = null;
    formOpen.value = true;
  };

  const openEdit = (row: T): void => {
    formMode.value = "update";
    editing.value = row;
    formOpen.value = true;
  };

  const closeForm = (): void => {
    formOpen.value = false;
    editing.value = null;
  };

  /* --------------------------------------------------------- Hapus */

  const deleteTarget = ref<T | null>(null);
  const deleteDialogOpen = ref(false);
  const deleting = ref(false);
  /** `true` bila konfirmasi sedang menangani aksi hapus massal. */
  const bulkDeleteMode = ref(false);

  const askDelete = (row: T): void => {
    deleteTarget.value = row;
    bulkDeleteMode.value = false;
    deleteDialogOpen.value = true;
  };

  const askBulkDelete = (): void => {
    if (!hasSelection.value) return;
    deleteTarget.value = null;
    bulkDeleteMode.value = true;
    deleteDialogOpen.value = true;
  };

  const closeDelete = (): void => {
    if (deleting.value) return;
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
  };

  /**
   * Tangani konfirmasi hapus.
   *
   * Dialog ditutup langsung (bukan lewat `closeDelete`) karena penjaga
   * `deleting` di sana ditujukan untuk aksi batal dari pengguna, sehingga
   * akan memblokir penutupan setelah penghapusan berhasil.
   */
  const confirmDelete = async (): Promise<void> => {
    if (deleting.value) return;

    deleting.value = true;

    try {
      if (bulkDeleteMode.value) {
        const ids = [...selected.value];
        const { succeeded, failed } = await deleteMany(ids);

        if (succeeded.length === 0) {
          throw new Error(
            ids.length === 0
              ? "Tidak ada baris yang dipilih."
              : "Semua baris gagal dihapus.",
          );
        }

        // Baris yang gagal tetap terpilih agar aksi dapat diulang,
        // sedangkan yang berhasil dikeluarkan agar tidak diproses lagi.
        selected.value = selected.value.filter((id) => failed.includes(id));

        if (failed.length > 0) {
          toast.danger(
            `${failed.length} baris gagal dihapus`,
            "Periksa koneksi lalu coba kembali.",
          );
        } else {
          toast.success(
            `${succeeded.length} ${options.resource} dihapus`,
            "Data berhasil dihapus permanen.",
          );
        }
      } else {
        const target = deleteTarget.value;
        if (!target) throw new Error("Baris yang akan dihapus tidak ditemukan.");

        const response = await options.remove(target.id);
        if (!response.success) {
          throw new Error(response.error ?? "Server tidak mengonfirmasi penghapusan.");
        }

        toast.success(
          `${options.resource} dihapus`,
          `“${options.rowLabel(target)}” dihapus permanen.`,
        );
      }

      deleteDialogOpen.value = false;
      deleteTarget.value = null;
      await reload();
    } catch (error) {
      // Dialog sengaja dibiarkan terbuka agar pengguna dapat mencoba ulang.
      toast.danger("Gagal menghapus", extractApiError(error).message);
    } finally {
      deleting.value = false;
    }
  };

  /* ----------------------------------------------------- Pemberitahuan */

  const toast = useToast();

  /** Hapus banyak baris sekaligus lewat API. */
  const deleteMany = async (
    ids: string[],
  ): Promise<{ succeeded: string[]; failed: string[] }> => {
    const results = await Promise.allSettled(
      ids.map((id) => options.remove(id)),
    );

    const succeeded: string[] = [];
    const failed: string[] = [];

    for (const [index, result] of results.entries()) {
      const id = ids[index];
      if (!id) continue;

      if (result.status === "fulfilled" && result.value.success) {
        succeeded.push(id);
      } else {
        failed.push(id);
      }
    }

    return { succeeded, failed };
  };

  /* --------------------------------------------------------- Aturan */

  /** Kembalikan pencarian, filter, dan halaman ke keadaan awal. */
  const resetFilters = (): void => {
    search.value = "";
    filters.value = filters.value.map((filter) => ({ ...filter, value: "all" }));
    page.value = 1;
  };

  return {
    // Data
    rows,
    loading,
    loadError,
    reload,
    // Pencarian, filter, paginasi
    search,
    page,
    perPage,
    filters,
    filterValue,
    onFilterChange,
    resetFilters,
    // Pengurutan
    sort,
    sortedRows,
    onSort,
    pageRows,
    // Pilihan
    selected,
    hasSelection,
    // Form
    formOpen,
    formMode,
    editing,
    openCreate,
    openEdit,
    closeForm,
    // Hapus
    deleteTarget,
    deleteDialogOpen,
    deleting,
    bulkDeleteMode,
    askDelete,
    askBulkDelete,
    closeDelete,
    confirmDelete,
    // Pemberitahuan
    toast,
  };
};
