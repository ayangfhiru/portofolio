<script setup lang="ts">
/**
 * Halaman kelola data project (tampilan tabel).
 *
 * Merangkai komponen panel admin yang bersifat generik —
 * `AdminTopbar`, `StatStrip`, `TableToolbar`, `DataTable`,
 * `PaginationBar`, `ModalDialog`, `ConfirmDialog` — sehingga halaman
 * untuk model lain (project-tags, stack, dsb.) dapat meniru susunan
 * yang sama tanpa menduplikasi komponennya.
 *
 * Seluruh data diambil dari `GET /api/projects` lalu diproses di sisi
 * klien (pencarian, filter, pengurutan, paginasi) karena volumenya
 * kecil. Bila kelak data membesar, cukup ganti sumber `pageRows`
 * menjadi hasil server tanpa mengubah komponen tampilan.
 */
import { computed, ref, watch } from "vue";
import { Pencil, Plus, Trash2 } from "@lucide/vue";
import {
  AdminTopbar,
  AppToast,
  ConfirmDialog,
  DataTable,
  ModalDialog,
  PaginationBar,
  ProjectForm,
  StatStrip,
  TableToolbar,
} from "~/components/admin";
import { useToast } from "~/composables/useToast";
import { formatDate, formatTime, highlightParts } from "~/utils/format";
import {
  deleteProject,
  deleteProjects,
  extractApiError,
} from "~/utils/post-project";
import type { DataTableColumn, StatItem, TopNavItem, ToolbarFilter } from "~/types/admin";
import type { ApiResponse } from "~/types/api";
import type { ProjectItem } from "~/types/project";

useHead({ title: "Kelola Project — Admin" });

const toast = useToast();

/* ---------------------------------------------------------- Topbar */

const NAV_ITEMS: TopNavItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "project", label: "Project", to: "/admin/project" },
  { key: "media", label: "Media" },
  { key: "message", label: "Pesan" },
  { key: "settings", label: "Pengaturan" },
];

const ADMIN_USER = { name: "Raka Devano", role: "Super Admin" };

/* ---------------------------------------------------------- Data */

const projects = ref<ProjectItem[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);

/** Ambil seluruh project dari API. */
const loadProjects = async (): Promise<void> => {
  loading.value = true;
  loadError.value = null;

  try {
    const response = await $fetch<ApiResponse<ProjectItem[]>>("/api/projects");
    projects.value = response.success && response.data ? response.data : [];
  } catch (error) {
    projects.value = [];
    loadError.value = extractApiError(error, "Gagal memuat data project.").message;
  } finally {
    loading.value = false;
  }
};

await loadProjects();

/* -------------------------------------------------- Pencarian & filter */

const search = ref("");
const page = ref(1);
const perPage = ref(8);

const filters = ref<ToolbarFilter[]>([
  {
    key: "category",
    label: "Kategori",
    value: "all",
    options: [
      { label: "Semua Kategori", value: "all" },
      { label: "Web", value: "web" },
      { label: "Mobile", value: "mobile" },
      { label: "OSS", value: "oss" },
    ],
  },
  {
    key: "featured",
    label: "Sorotan",
    value: "all",
    options: [
      { label: "Semua Sorotan", value: "all" },
      { label: "Unggulan", value: "featured" },
      { label: "Biasa", value: "plain" },
    ],
  },
]);

const filterValue = (key: string): string =>
  filters.value.find((filter) => filter.key === key)?.value ?? "all";

const onFilterChange = (key: string, value: string): void => {
  filters.value = filters.value.map((filter) =>
    filter.key === key ? { ...filter, value } : filter,
  );
  page.value = 1;
};

/** Apakah satu project cocok dengan kata kunci pencarian? */
const matchesSearch = (project: ProjectItem, query: string): boolean => {
  if (!query) return true;

  const haystack = [
    project.title,
    project.slug,
    project.description,
    project.category,
    String(project.year),
    project.tags.map((tag) => tag.name).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

const filteredProjects = computed(() => {
  const query = search.value.trim().toLowerCase();
  const category = filterValue("category");
  const featured = filterValue("featured");

  return projects.value.filter((project) => {
    if (!matchesSearch(project, query)) return false;
    if (category !== "all" && project.category !== category) return false;
    if (featured === "featured" && !project.featured) return false;
    if (featured === "plain" && project.featured) return false;
    return true;
  });
});

/* ------------------------------------------------------- Pengurutan */

interface SortState {
  key: string;
  dir: "asc" | "desc";
}

const sort = ref<SortState>({ key: "year", dir: "desc" });

/** Nilai pembanding pengurutan — angka untuk kolom numerik/tanggal. */
const sortValue = (project: ProjectItem, key: string): string | number => {
  if (key === "year") return project.year;
  if (key === "featured") return project.featured ? 1 : 0;
  if (key === "updatedAt") return new Date(project.updatedAt).getTime();
  if (key === "category") return project.category;
  return project.title;
};

const sortedProjects = computed(() => {
  const { key, dir } = sort.value;
  const factor = dir === "asc" ? 1 : -1;

  return [...filteredProjects.value].sort((a, b) => {
    const left = sortValue(a, key);
    const right = sortValue(b, key);

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * factor;
    }

    return String(left).localeCompare(String(right)) * factor;
  });
});

const onSort = (key: string): void => {
  if (sort.value.key === key) {
    sort.value = { key, dir: sort.value.dir === "asc" ? "desc" : "asc" };
  } else {
    // Kolom tanggal/angka awalnya menurun, kolom teks menaik.
    const numeric = key === "year" || key === "updatedAt" || key === "featured";
    sort.value = { key, dir: numeric ? "desc" : "asc" };
  }
};

/** Kembalikan pencarian, filter, dan halaman ke keadaan awal. */
const resetFilters = (): void => {
  search.value = "";
  filters.value = filters.value.map((filter) => ({ ...filter, value: "all" }));
  page.value = 1;
};

// Kembali ke halaman pertama tiap pencarian berubah.
watch(search, () => {
  page.value = 1;
});

/* -------------------------------------------------------- Paginasi */

const pageRows = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return sortedProjects.value.slice(start, start + perPage.value);
});

/* --------------------------------------------------------- Pilihan */

const selected = ref<string[]>([]);
const hasSelection = computed(() => selected.value.length > 0);

/* --------------------------------------------------------- Statistik */

const stats = computed<StatItem[]>(() => {
  const uniqueCategories = new Set(projects.value.map((project) => project.category));
  const uniqueTags = new Set(
    projects.value.flatMap((project) => project.tags.map((tag) => tag.name)),
  );

  return [
    {
      key: "total",
      label: "Total Project",
      value: projects.value.length,
      hint: "Semua data terdaftar",
    },
    {
      key: "featured",
      label: "Unggulan",
      value: projects.value.filter((project) => project.featured).length,
      hint: "Tampil menonjol di bagian Work",
    },
    {
      key: "category",
      label: "Kategori",
      value: uniqueCategories.size,
      hint: "Kategori unik terpakai",
    },
    {
      key: "tags",
      label: "Tag",
      value: uniqueTags.size,
      hint: "Tag unik terpakai",
    },
  ];
});

/* ----------------------------------------------------------- Kolom */

const COLUMNS: DataTableColumn[] = [
  { key: "title", label: "Project", sortable: true, hideLabel: true },
  { key: "category", label: "Kategori", sortable: true },
  { key: "year", label: "Tahun", sortable: true },
  { key: "featured", label: "Sorotan", sortable: true },
  { key: "href", label: "Tautan" },
  { key: "updatedAt", label: "Diperbarui", sortable: true, align: "right" },
];

/* ------------------------------------------------- Form tambah/ubah */

const formOpen = ref(false);
const formMode = ref<"create" | "update">("create");
const editing = ref<ProjectItem | null>(null);

const openCreate = (): void => {
  formMode.value = "create";
  editing.value = null;
  formOpen.value = true;
};

const openEdit = (row: ProjectItem): void => {
  formMode.value = "update";
  editing.value = row;
  formOpen.value = true;
};

const closeForm = (): void => {
  formOpen.value = false;
  editing.value = null;
};

const onSaved = async (project: ProjectItem): Promise<void> => {
  const verb = formMode.value === "update" ? "diperbarui" : "ditambahkan";

  closeForm();
  toast.success(`Project ${verb}`, `“${project.title}” tersimpan.`);
  await loadProjects();
};

/* --------------------------------------------------------- Hapus */

const deleteTarget = ref<ProjectItem | null>(null);
const deleteDialogOpen = ref(false);
const deleting = ref(false);
/** `true` bila konfirmasi sedang menangani aksi hapus massal. */
const bulkDeleteMode = ref(false);

const askDelete = (row: ProjectItem): void => {
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

const confirmDelete = async (): Promise<void> => {
  if (deleting.value) return;

  deleting.value = true;

  try {
    if (bulkDeleteMode.value) {
      const ids = [...selected.value];
      const { succeeded, failed } = await deleteProjects(ids);

      // Tidak ada satu pun yang berhasil: biarkan dialog terbuka agar
      // pengguna dapat mengulang tanpa kehilangan pilihannya.
      if (succeeded.length === 0) {
        throw new Error(
          ids.length === 0
            ? "Tidak ada project yang dipilih."
            : "Semua project gagal dihapus.",
        );
      }

      // Baris yang gagal tetap terpilih agar aksi dapat diulang,
      // sedangkan yang berhasil dikeluarkan agar tidak diproses lagi.
      selected.value = selected.value.filter((id) => failed.includes(id));

      if (failed.length > 0) {
        toast.danger(
          `${failed.length} project gagal dihapus`,
          "Periksa koneksi lalu coba kembali.",
        );
      } else {
        toast.success(
          `${succeeded.length} project dihapus`,
          "Data berhasil dihapus permanen.",
        );
      }
    } else {
      const target = deleteTarget.value;
      if (!target) throw new Error("Data yang akan dihapus tidak ditemukan.");

      const response = await deleteProject(target.id);
      if (!response.success) {
        throw new Error(response.error ?? "Server tidak mengonfirmasi penghapusan.");
      }

      toast.success("Project dihapus", `“${target.title}” dihapus permanen.`);
    }

    // Ditutup langsung, bukan lewat `closeDelete()`: penjaga `deleting`
    // pada penutup tersebut ditujukan untuk aksi batal dari pengguna,
    // sehingga akan memblokir penutupan setelah penghapusan berhasil.
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    await loadProjects();
  } catch (error) {
    // Dialog sengaja dibiarkan terbuka agar pengguna dapat mencoba ulang;
    // nilai `deleting` dipulihkan oleh blok `finally`.
    toast.danger("Gagal menghapus", extractApiError(error).message);
  } finally {
    deleting.value = false;
  }
};

/* --------------------------------------------------------- Format */

/** Bagian teks judul/slug yang cocok dengan pencarian. */
const titleParts = (value: string) => highlightParts(value, search.value);
</script>

<template>
  <div class="min-h-screen bg-admin-bg text-admin-ink">
    <AdminTopbar
      :nav-items="NAV_ITEMS"
      active-key="project"
      :user="ADMIN_USER"
    />

    <main class="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
      <!-- Kepala halaman -->
      <div class="flex flex-wrap items-end justify-between gap-6 py-9">
        <div class="min-w-0">
          <div class="font-mono text-[.71rem] font-bold uppercase tracking-[.17em] text-admin-accent">
            Admin · Project
          </div>
          <h1 class="mt-3 font-display text-[clamp(1.95rem,4.2vw,2.85rem)] font-extrabold leading-[1.04] tracking-tight">
            Data project <span class="font-bold text-admin-muted-2">/ view table</span>
          </h1>
          <p class="mt-3 max-w-[74ch] text-[.985rem] text-admin-muted">
            Kelola seluruh data project yang tampil pada bagian
            <b class="text-admin-ink">Work</b> di halaman utama. Data tersimpan melalui
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/projects</code>,
            diperbarui via
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/projects/:id</code>,
            dan dihapus via
            <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/projects/:id</code>.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-[11px] bg-admin-accent px-[18px] py-[11px] text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(217,45,32,.55)] transition hover:-translate-y-0.5 hover:bg-admin-accent-dark"
          @click="openCreate"
        >
          <Plus class="h-4 w-4" aria-hidden="true" />
          Tambah Project
        </button>
      </div>

      <!-- Statistik -->
      <StatStrip :items="stats" class="mb-6 mt-1" />

      <!-- Panel tabel -->
      <section class="overflow-hidden rounded-[20px] border border-admin-line bg-admin-card shadow-[0_1px_2px_rgba(16,24,40,.05)]">
        <TableToolbar
          v-model:search="search"
          search-placeholder="Cari judul, slug, kategori, atau deskripsi…"
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
            @click="loadProjects"
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
          empty-description="Coba ubah kata kunci pencarian atau filter yang digunakan."
          @sort="onSort"
        >
          <!-- Judul + slug -->
          <template #cell-title="{ row }">
            <div class="flex min-w-[250px] items-center gap-3">
              <div class="h-10 w-[52px] flex-none overflow-hidden rounded-[9px] border border-admin-line bg-admin-bg-2">
                <img
                  :src="row.imageUrl"
                  :alt="row.title"
                  loading="lazy"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="min-w-0">
                <div class="font-bold leading-snug tracking-tight">
                  <template v-for="(part, index) in titleParts(row.title)" :key="index">
                    <mark v-if="part.matched" class="rounded-[3px] bg-[rgba(217,45,32,.16)] px-0.5 text-admin-accent-dark">{{ part.text }}</mark>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </div>
                <div class="mt-0.5 truncate font-mono text-[.715rem] text-admin-muted-2">
                  <span class="text-admin-line-2">/work/</span><template v-for="(part, index) in titleParts(row.slug)" :key="index"><mark v-if="part.matched" class="rounded-[3px] bg-[rgba(217,45,32,.16)] px-0.5 text-admin-accent-dark">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template>
                </div>
              </div>
            </div>
          </template>

          <!-- Kategori -->
          <template #cell-category="{ row }">
            <span class="inline-flex items-center gap-[7px] rounded-lg border border-admin-line bg-admin-bg-2 px-[11px] py-[5px] text-[.795rem] font-semibold capitalize text-admin-ink-2">
              <span class="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-admin-accent" aria-hidden="true" />
              {{ row.category }}
            </span>
          </template>

          <!-- Tahun -->
          <template #cell-year="{ row }">
            <span class="font-mono text-[.83rem] font-bold text-admin-ink-2">{{ row.year }}</span>
          </template>

          <!-- Sorotan (featured) -->
          <template #cell-featured="{ row }">
            <span
              class="inline-flex items-center gap-[7px] rounded-full px-[11px] py-[5px] text-[.735rem] font-bold"
              :class="row.featured ? 'bg-admin-ok-soft text-admin-ok' : 'bg-admin-bg-2 text-admin-muted'"
            >
              <span
                class="h-1.5 w-1.5 rounded-full"
                :class="row.featured ? 'bg-admin-ok' : 'bg-admin-muted-2'"
                aria-hidden="true"
              />
              {{ row.featured ? "Unggulan" : "Biasa" }}
            </span>
          </template>

          <!-- Tautan -->
          <template #cell-href="{ row }">
            <a
              v-if="row.href"
              :href="row.href"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1.5 border-b border-dashed border-admin-info/40 pb-px font-mono text-[.745rem] text-admin-info transition hover:border-admin-accent hover:text-admin-accent"
            >
              {{ String(row.href).replace(/^https?:\/\//, "").slice(0, 26) }} ↗
            </a>
            <span v-else class="text-admin-muted-2">—</span>
          </template>

          <!-- Diperbarui -->
          <template #cell-updatedAt="{ row }">
            <div class="whitespace-nowrap text-[.815rem] text-admin-muted">
              {{ formatDate(row.updatedAt) }}
              <span class="mt-0.5 block font-mono text-[.715rem] text-admin-muted-2">
                {{ formatTime(row.updatedAt) }}
              </span>
            </div>
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
          :total="sortedProjects.length"
        />
      </section>
    </main>

    <!-- Modal tambah / ubah -->
    <ModalDialog
      :open="formOpen"
      eyebrow="Admin · Project"
      :title="formMode === 'create' ? 'Tambah project baru' : 'Update project'"
      body-class="p-0"
      @close="closeForm"
    >
      <template #description>
        <template v-if="formMode === 'create'">
          Isi data project berikut. Data tersimpan melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">POST /api/projects</code>
          dan tampil pada bagian Work di halaman utama.
        </template>
        <template v-else>
          Perbarui data project. Hanya field yang berubah yang dikirim melalui
          <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">PATCH /api/projects/:id</code>.
        </template>
      </template>

      <ProjectForm
        :key="`${formMode}-${editing?.id ?? 'new'}`"
        :mode="formMode"
        :initial-project="editing"
        cancel-label="Batal"
        @cancel="closeForm"
        @saved="onSaved"
      />
    </ModalDialog>

    <!-- Dialog konfirmasi hapus -->
    <ConfirmDialog
      :open="deleteDialogOpen"
      :loading="deleting"
      :title="bulkDeleteMode ? `Hapus ${selected.length} project?` : 'Hapus project ini?'"
      confirm-label="Ya, hapus"
      @confirm="confirmDelete"
      @close="closeDelete"
    >
      <!-- Kalimat penuh lewat slot: label sasaran saja tidak merangkai kalimat utuh -->
      <template v-if="bulkDeleteMode">
        Sebanyak <b class="font-bold text-admin-ink">{{ selected.length }} project</b>
        beserta seluruh tag-nya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
      </template>
      <template v-else>
        Data <b class="font-bold text-admin-ink">“{{ deleteTarget?.title }}”</b>
        beserta seluruh tag-nya akan dihapus permanen melalui
        <code class="rounded-md border border-admin-line bg-admin-bg-2 px-1.5 py-0.5 font-mono text-[.82em] text-admin-ink-2">DELETE /api/projects/:id</code>.
      </template>
    </ConfirmDialog>

    <AppToast />
  </div>
</template>
