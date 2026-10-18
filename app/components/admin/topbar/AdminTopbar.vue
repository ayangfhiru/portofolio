<script setup lang="ts">
/**
 * Topbar panel admin.
 *
 * Merangkai brand, menu modul desktop, pencarian, CTA, menu pengguna,
 * dan laci mobile. Tiap potongan tampilan dipecah ke `./topbar/*` agar
 * tanggung jawabnya kecil dan bisa dipakai ulang.
 *
 * Keadaan lapisan yang terbuka (dropdown menu, menu pengguna, pencarian)
 * disimpan sebagai satu state tunggal sehingga klik di luar dan tombol
 * Esc cukup mengosongkan satu variabel.
 */
import { Menu, Plus, Search, X } from "@lucide/vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { AdminNavItem, AdminNavLink, AdminUser } from "~/types/admin";
import {
  ADMIN_NAV_ITEMS,
  ADMIN_SEARCH_LINKS,
  ADMIN_USER_LINKS,
} from "~/utils/admin-nav";
import AdminBrand from "./AdminBrand.vue";
import AdminMobileDrawer from "./AdminMobileDrawer.vue";
import AdminNavMenu from "./AdminNavMenu.vue";
import AdminProfileMenu from "./AdminProfileMenu.vue";
import AdminSearchBar from "./AdminSearchBar.vue";

interface Props {
  brand?: string;
  mark?: string;
  env?: string;
  navItems?: AdminNavItem[];
  /** Kunci menu yang sedang aktif (disorot). */
  activeKey?: string;
  cta?: { label: string; to: string };
  user?: AdminUser;
}

const props = withDefaults(defineProps<Props>(), {
  brand: "ghege.dev",
  mark: "</>",
  env: "Admin",
  navItems: () => ADMIN_NAV_ITEMS,
  activeKey: "",
  cta: () => ({ label: "Tambah Project", to: "/admin/project?tambah=1" }),
  user: undefined,
});

/**
 * Kunci lapisan yang sedang terbuka: "search", "profile", atau kunci
 * grup menu. Nilai kosong berarti tidak ada yang terbuka.
 */
const openLayer = ref("");
const drawerOpen = ref(false);
const searchQuery = ref("");
const scrolled = ref(false);
const topbar = ref<HTMLElement | null>(null);

const searchOpen = computed(() => openLayer.value === "search");

const searchResults = computed<AdminNavLink[]>(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return ADMIN_SEARCH_LINKS;

  return ADMIN_SEARCH_LINKS.filter((link) =>
    `${link.label} ${link.description ?? ""} ${link.to}`
      .toLowerCase()
      .includes(query),
  );
});

const toggleLayer = (key: string) => {
  openLayer.value = openLayer.value === key ? "" : key;
};

const closeLayers = () => {
  openLayer.value = "";
};

/** Menutup seluruh lapisan — dipanggil setelah menuju suatu rute. */
const navigate = () => {
  openLayer.value = "";
  drawerOpen.value = false;
};

const handleHoverOpen = (key: string) => {
  openLayer.value = key;
};

const handleHoverClose = (key: string) => {
  if (openLayer.value === key) openLayer.value = "";
};

const isInsideTopbar = (target: EventTarget | null): boolean =>
  target instanceof Node &&
  topbar.value !== null &&
  topbar.value.contains(target);

const handleDocumentClick = (event: MouseEvent) => {
  if (isInsideTopbar(event.target)) return;
  openLayer.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape") return;

  if (drawerOpen.value) {
    drawerOpen.value = false;
    return;
  }

  openLayer.value = "";
  searchQuery.value = "";
};

const handleScroll = () => {
  scrolled.value = window.scrollY > 8;
};

onMounted(() => {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleDocumentClick);
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <header
    ref="topbar"
    class="sticky top-0 z-50 border-b border-admin-line bg-white/85 backdrop-blur-xl"
  >
    <div
      class="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 transition-[height] duration-200 sm:px-6 lg:gap-4 lg:px-8"
      :class="scrolled ? 'h-15.5' : 'h-19'"
    >
      <AdminBrand :brand="props.brand" :mark="props.mark" :env="props.env" />

      <AdminNavMenu
        class="ml-1 min-w-0"
        :items="props.navItems"
        :active-key="props.activeKey"
        :open-key="openLayer"
        @toggle="toggleLayer"
        @hover-open="handleHoverOpen"
        @hover-close="handleHoverClose"
        @navigate="closeLayers"
      />

      <div class="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors"
          :class="
            searchOpen
              ? 'border-admin-line-2 bg-admin-bg-2 text-admin-ink'
              : 'border-admin-line text-admin-muted hover:bg-admin-bg-2 hover:text-admin-ink'
          "
          :aria-expanded="searchOpen"
          aria-controls="topbar-search"
          :aria-label="searchOpen ? 'Tutup pencarian' : 'Buka pencarian'"
          @click="toggleLayer('search')"
        >
          <component :is="searchOpen ? X : Search" class="h-4.5 w-4.5" />
        </button>

        <NuxtLink
          v-if="props.cta"
          :to="props.cta.to"
          class="hidden items-center gap-2 rounded-xl bg-admin-accent px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-admin-accent-dark sm:flex"
          @click="navigate"
        >
          <Plus class="h-4 w-4" />
          {{ props.cta.label }}
        </NuxtLink>

        <AdminProfileMenu
          v-if="props.user"
          :user="props.user"
          :links="ADMIN_USER_LINKS"
          :open="openLayer === 'profile'"
          @toggle="toggleLayer('profile')"
          @navigate="navigate"
        />

        <button
          type="button"
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-admin-line text-admin-muted transition-colors hover:bg-admin-bg-2 hover:text-admin-ink lg:hidden"
          :aria-expanded="drawerOpen"
          aria-controls="topbar-drawer"
          :aria-label="drawerOpen ? 'Tutup menu' : 'Buka menu'"
          @click="drawerOpen = !drawerOpen"
        >
          <component :is="drawerOpen ? X : Menu" class="h-4.5 w-[18px]" />
        </button>
      </div>
    </div>

    <AdminSearchBar
      :open="searchOpen"
      v-model="searchQuery"
      :results="searchResults"
      @close="closeLayers"
      @navigate="navigate"
    />

    <AdminMobileDrawer
      :open="drawerOpen"
      :brand="props.brand"
      :mark="props.mark"
      :env="props.env"
      :items="props.navItems"
      :links="ADMIN_USER_LINKS"
      :active-key="props.activeKey"
      :user="props.user"
      :cta="props.cta"
      @close="drawerOpen = false"
      @navigate="navigate"
    />
  </header>
</template>
