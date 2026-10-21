<script setup lang="ts">
/**
 * Laci navigasi untuk layar sempit.
 *
 * Menyalin struktur menu desktop: tautan langsung tampil apa adanya,
 * sementara grup menjadi akordeon yang dapat dibuka satu per satu.
 *
 * Kontennya diteleport ke `body` karena topbar memakai `backdrop-blur`
 * yang menjadikan elemen tersebut containing block bagi `fixed`, sehingga
 * tanpa teleport laci akan menempel pada tinggi topbar saja.
 */
import { ChevronDown, LoaderCircle, LogOut, Plus, X } from "@lucide/vue";
import { ref } from "vue";
import type { AdminNavItem, AdminNavLink, AdminUser } from "~/types";
import AdminBrand from "./AdminBrand.vue";

interface Props {
  open?: boolean;
  brand?: string;
  mark?: string;
  env?: string;
  items?: AdminNavItem[];
  links?: AdminNavLink[];
  activeKey?: string;
  user?: AdminUser;
  cta?: { label: string; to: string };
  /** Sedang mengirim permintaan keluar. */
  signingOut?: boolean;
  /** Pesan galat keluar terakhir; kosong bila tidak ada. */
  logoutError?: string;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  brand: "ghege.dev",
  mark: "</>",
  env: "Admin",
  items: () => [],
  links: () => [],
  activeKey: "",
  user: undefined,
  cta: undefined,
  signingOut: false,
  logoutError: "",
});

const emit = defineEmits<{ close: []; navigate: []; logout: [] }>();

/** Kunci grup yang sedang terbuka; kosong berarti semua tertutup. */
const expandedKey = ref("");

const toggleGroup = (key: string) => {
  expandedKey.value = expandedKey.value === key ? "" : key;
};

const isGroupActive = (item: AdminNavItem): boolean =>
  item.key === props.activeKey ||
  (item.children ?? []).some((child) => child.key === props.activeKey);

const isLinkActive = (item: AdminNavItem): boolean =>
  item.key === props.activeKey;

/** Kelas untuk tautan langsung pada laci, dipakai bersama cadangan nonaktif. */
const linkClass = (item: AdminNavItem): string =>
  [
    "mb-1 flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-colors",
    isLinkActive(item)
      ? "bg-admin-accent-soft text-admin-accent"
      : "text-admin-muted hover:bg-admin-bg-2 hover:text-admin-ink",
  ].join(" ");

const isChildActive = (item: AdminNavItem): boolean =>
  (item.children ?? []).some((child) => child.key === props.activeKey);
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.open"
        id="topbar-drawer"
        class="fixed inset-0 z-[60] lg:hidden"
      >
        <div
          class="absolute inset-0 bg-admin-ink/40 backdrop-blur-sm"
          @click="emit('close')"
        />

        <aside
          class="absolute right-0 top-0 flex h-full w-[min(88vw,344px)] flex-col border-l border-admin-line bg-admin-card text-admin-ink"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi admin"
        >
          <div
            class="flex items-center justify-between gap-3 border-b border-admin-line px-4 py-3.5"
          >
            <AdminBrand
              :brand="props.brand"
              :mark="props.mark"
              :env="props.env"
            />
            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-admin-bg-2 hover:text-admin-ink"
              aria-label="Tutup menu"
              @click="emit('close')"
            >
              <X class="h-[18px] w-[18px]" />
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto px-3 py-4">
            <template v-for="item in props.items" :key="item.key">
              <!-- Grup menjadi akordeon -->
              <div v-if="item.children?.length" class="mb-1">
                <button
                  type="button"
                  class="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold transition-colors"
                  :class="
                    isGroupActive(item)
                      ? 'bg-admin-accent-soft text-admin-accent'
                      : 'text-admin-ink hover:bg-admin-bg-2'
                  "
                  :aria-expanded="expandedKey === item.key"
                  :aria-controls="`drawer-group-${item.key}`"
                  @click="toggleGroup(item.key)"
                >
                  <component
                    :is="item.icon"
                    v-if="item.icon"
                    class="h-4 w-4 shrink-0"
                  />
                  <span class="flex-1">{{ item.label }}</span>
                  <span
                    v-if="isChildActive(item)"
                    class="h-2 w-2 shrink-0 rounded-full bg-admin-accent"
                    aria-hidden="true"
                  />
                  <ChevronDown
                    class="h-4 w-4 shrink-0 transition-transform"
                    :class="expandedKey === item.key ? 'rotate-180' : ''"
                  />
                </button>

                <div
                  v-show="expandedKey === item.key"
                  :id="`drawer-group-${item.key}`"
                  class="ml-5 mt-1 space-y-0.5 border-l border-admin-line pl-3"
                >
                  <NuxtLink
                    v-for="child in item.children"
                    :key="child.key"
                    :to="child.to"
                    class="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    :class="
                      child.key === props.activeKey
                        ? 'bg-admin-accent-soft font-bold text-admin-accent'
                        : 'text-admin-ink-2 hover:bg-admin-bg-2'
                    "
                    @click="emit('navigate')"
                  >
                    <component
                      :is="child.icon"
                      v-if="child.icon"
                      class="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span>{{ child.label }}</span>
                  </NuxtLink>
                </div>
              </div>

              <!-- Tautan langsung -->
              <NuxtLink
                v-else-if="item.to"
                :to="item.to"
                :class="linkClass(item)"
                :aria-current="isLinkActive(item) ? 'page' : undefined"
                @click="emit('navigate')"
              >
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  class="h-4 w-4 shrink-0"
                />
                {{ item.label }}
              </NuxtLink>
              <span v-else :class="linkClass(item)">
                <component
                  :is="item.icon"
                  v-if="item.icon"
                  class="h-4 w-4 shrink-0"
                />
                {{ item.label }}
              </span>
            </template>
          </nav>

          <div class="border-t border-admin-line p-4">
            <NuxtLink
              v-if="props.cta"
              :to="props.cta.to"
              class="flex w-full items-center justify-center gap-2 rounded-xl bg-admin-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-admin-accent-dark"
              @click="emit('navigate')"
            >
              <Plus class="h-4 w-4" />
              {{ props.cta.label }}
            </NuxtLink>

            <div
              v-if="props.user"
              class="mt-3 flex items-center gap-3 rounded-xl bg-admin-bg-2 px-3 py-2.5"
            >
              <span
                class="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-[11px] border border-admin-line bg-admin-card font-mono text-[.7rem] font-bold text-admin-muted"
              >
                <img
                  v-if="props.user.avatar"
                  :src="props.user.avatar"
                  :alt="`Avatar ${props.user.name}`"
                  class="h-full w-full object-cover"
                />
                <template v-else>{{ props.user.name.charAt(0) }}</template>
              </span>
              <span class="min-w-0">
                <span class="block truncate text-sm font-bold">{{
                  props.user.name
                }}</span>
                <span
                  class="block font-mono text-[.62rem] uppercase tracking-[.12em] text-admin-muted-2"
                >
                  {{ props.user.role }}
                </span>
              </span>
            </div>

            <div class="mt-2 space-y-0.5">
              <NuxtLink
                v-for="link in props.links"
                :key="link.key"
                :to="link.to"
                class="flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-admin-ink-2 transition-colors hover:bg-admin-bg-2"
                @click="emit('navigate')"
              >
                <component
                  :is="link.icon"
                  v-if="link.icon"
                  class="mt-0.5 h-4 w-4 shrink-0 text-admin-muted"
                />
                <span class="min-w-0">
                  <span class="block text-sm font-semibold">{{
                    link.label
                  }}</span>
                  <span
                    v-if="link.description"
                    class="block text-xs text-admin-muted"
                  >
                    {{ link.description }}
                  </span>
                </span>
              </NuxtLink>
            </div>

            <div v-if="props.user" class="mt-2 border-t border-admin-line pt-2">
              <p
                v-if="props.logoutError"
                role="alert"
                class="px-3 pb-1 text-xs text-admin-accent-dark"
              >
                {{ props.logoutError }}
              </p>
              <button
                type="button"
                :disabled="props.signingOut"
                :aria-busy="props.signingOut"
                class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-admin-ink-2 transition-colors hover:bg-admin-accent-soft hover:text-admin-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
                @click="emit('logout')"
              >
                <LoaderCircle
                  v-if="props.signingOut"
                  class="h-4 w-4 shrink-0 animate-spin"
                  aria-hidden="true"
                />
                <LogOut v-else class="h-4 w-4 shrink-0" aria-hidden="true" />
                Keluar
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
