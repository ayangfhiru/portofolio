<script setup lang="ts">
/**
 * Menu navigasi desktop pada topbar admin.
 *
 * Item tanpa `children` dirender sebagai tautan langsung; item dengan
 * `children` menjadi dropdown. Keadaan dropdown terbuka dipegang oleh
 * `AdminTopbar` lewat `openKey`, sehingga lapisan yang terbuka selalu
 * tunggal dan cukup dikosongkan oleh satu state.
 */
import { onMounted, ref } from "vue";
import { ChevronDown } from "@lucide/vue";
import type { AdminNavItem } from "~/types";

interface Props {
  items?: AdminNavItem[];
  activeKey?: string;
  /** Kunci lapisan yang sedang terbuka. */
  openKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  activeKey: "",
  openKey: "",
});

const emit = defineEmits<{
  toggle: [key: string];
  hoverOpen: [key: string];
  hoverClose: [key: string];
  navigate: [];
}>();

/** Apakah item atau salah satu anaknya menunjuk halaman yang sedang aktif. */
const isGroupActive = (item: AdminNavItem): boolean =>
  item.key === props.activeKey ||
  (item.children ?? []).some((child) => child.key === props.activeKey);

const isLinkActive = (item: AdminNavItem): boolean => item.key === props.activeKey;

/**
 * Kelas untuk tautan langsung.
 *
 * Ditulis sebagai string agar bisa dipakai bersama oleh `NuxtLink`
 * maupun cadangan nonaktif tanpa mengulang daftar kelas.
 */
const linkClass = (item: AdminNavItem): string =>
  [
    "flex shrink-0 items-center gap-2 rounded-[9px] px-3.5 py-2 text-sm font-semibold transition-colors",
    isLinkActive(item)
      ? "bg-admin-accent-soft text-admin-accent"
      : "text-admin-muted hover:bg-admin-bg-2 hover:text-admin-ink",
  ].join(" ");

/**
 * Hover hanya membuka dropdown pada perangkat yang benar-benar punya
 * kursor dan lebarnya muat menu, agar tidak mengganggu sentuhan.
 */
const supportsHover = ref(false);

onMounted(() => {
  supportsHover.value = window.matchMedia("(hover: hover) and (min-width: 1024px)").matches;
});

const handleMouseEnter = (item: AdminNavItem) => {
  if (!item.children?.length || !supportsHover.value) return;
  emit("hoverOpen", item.key);
};

const handleMouseLeave = (item: AdminNavItem) => {
  if (!item.children?.length || !supportsHover.value) return;
  emit("hoverClose", item.key);
};
</script>

<template>
  <nav class="hidden min-w-0 items-center gap-1 lg:flex" aria-label="Menu modul admin">
    <template v-for="item in props.items" :key="item.key">
      <!-- Grup: tautan langsung dengan panel dropdown -->
      <div
        v-if="item.children?.length"
        class="relative"
        @mouseenter="handleMouseEnter(item)"
        @mouseleave="handleMouseLeave(item)"
      >
        <button
          type="button"
          :id="`topbar-menu-${item.key}-button`"
          class="flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-sm font-semibold transition-colors"
          :class="
            isGroupActive(item)
              ? 'bg-admin-accent-soft text-admin-accent'
              : 'text-admin-muted hover:bg-admin-bg-2 hover:text-admin-ink'
          "
          :aria-expanded="props.openKey === item.key"
          :aria-controls="`topbar-menu-${item.key}`"
          aria-haspopup="true"
          @click="emit('toggle', item.key)"
        >
          {{ item.label }}
          <ChevronDown
            class="h-3.5 w-3.5 transition-transform"
            :class="props.openKey === item.key ? 'rotate-180' : ''"
          />
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="-translate-y-1 opacity-0"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="translate-y-0 opacity-0"
        >
          <div
            v-if="props.openKey === item.key"
            :id="`topbar-menu-${item.key}`"
            role="menu"
            class="absolute left-0 top-[calc(100%+8px)] z-50 w-[290px] overflow-hidden rounded-2xl border border-admin-line bg-admin-card p-1.5 shadow-[0_18px_44px_-18px_rgba(15,23,40,.28)]"
          >
            <NuxtLink
              v-for="child in item.children"
              :key="child.key"
              :to="child.to"
              role="menuitem"
              class="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors"
              :class="
                child.key === props.activeKey
                  ? 'bg-admin-accent-soft text-admin-accent'
                  : 'text-admin-ink-2 hover:bg-admin-bg-2'
              "
              @click="emit('navigate')"
            >
              <component :is="child.icon" v-if="child.icon" class="mt-0.5 h-4 w-4 shrink-0" />
              <span class="min-w-0">
                <span class="block text-sm font-semibold">{{ child.label }}</span>
                <span v-if="child.description" class="block text-xs text-admin-muted">
                  {{ child.description }}
                </span>
              </span>
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <!-- Tautan langsung -->
      <NuxtLink
        v-else-if="item.to"
        :to="item.to"
        :class="linkClass(item)"
        :aria-current="isLinkActive(item) ? 'page' : undefined"
        @click="emit('navigate')"
      >
        <component :is="item.icon" v-if="item.icon" class="h-4 w-4" />
        {{ item.label }}
      </NuxtLink>
      <span v-else :class="linkClass(item)">
        <component :is="item.icon" v-if="item.icon" class="h-4 w-4" />
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
