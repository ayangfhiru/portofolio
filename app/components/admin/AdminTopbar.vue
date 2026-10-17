<script setup lang="ts">
import type { TopNavItem } from "~/types/admin";

/**
 * Topbar panel admin.
 *
 * Bersifat generik: brand, menu, dan identitas pengirim semuanya lewat
 * props sehingga komponen ini bisa dipakai ulang untuk halaman admin
 * lain (project-tags, stack, dsb.) tanpa diubah.
 */

interface Props {
  brand?: string;
  mark?: string;
  env?: string;
  navItems?: TopNavItem[];
  /** Kunci menu yang sedang aktif (disorot). */
  activeKey?: string;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  brand: "raka.dev",
  mark: "</>",
  env: "Admin",
  navItems: () => [],
  activeKey: "",
  user: undefined,
});

const isActive = (item: TopNavItem): boolean =>
  Boolean(props.activeKey) && item.key === props.activeKey;
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-admin-line bg-white/85 backdrop-blur-xl">
    <div class="mx-auto flex h-[66px] w-full max-w-[1280px] items-center gap-5 px-4 sm:px-6 lg:px-8">
      <!-- Brand -->
      <div class="flex shrink-0 items-center gap-2.5 font-display text-[1.02rem] font-extrabold tracking-tight">
        <span
          class="relative grid h-[33px] w-[33px] place-items-center rounded-[10px] bg-admin-ink font-mono text-[.72rem] font-bold text-white"
        >
          {{ props.mark }}
          <span
            class="absolute -right-[3px] -top-[3px] h-[9px] w-[9px] rounded-full border-2 border-white bg-admin-accent"
            aria-hidden="true"
          />
        </span>
        <span>{{ props.brand }}</span>
        <span
          class="rounded-md bg-admin-accent-soft px-2 py-[3px] font-mono text-[.62rem] font-bold uppercase tracking-[.13em] text-admin-accent"
        >
          {{ props.env }}
        </span>
      </div>

      <!-- Menu
           `overflow-x-auto` dipakai agar seluruh tautan modul tetap
           terjangkau pada lebar sempit tanpa mengubah tampilan ketika
           semuanya masih muat. -->
      <nav
        v-if="props.navItems.length"
        class="ml-3 hidden min-w-0 flex-nowrap items-center gap-1 overflow-x-auto [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden"
      >
        <component
          :is="item.to ? 'NuxtLink' : 'span'"
          v-for="item in props.navItems"
          :key="item.key"
          :to="item.to"
          class="shrink-0 rounded-[9px] px-3.5 py-2 text-sm font-semibold transition-colors"
          :class="
            isActive(item)
              ? 'bg-admin-accent-soft text-admin-accent'
              : item.to
                ? 'text-admin-muted hover:bg-admin-bg-2 hover:text-admin-ink'
                : 'cursor-default text-admin-muted-2'
          "
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          {{ item.label }}
        </component>
      </nav>

      <!-- Pengguna -->
      <div v-if="props.user" class="ml-auto flex items-center gap-3">
        <div class="hidden text-right leading-tight sm:block">
          <div class="text-[.83rem] font-bold">{{ props.user.name }}</div>
          <div class="font-mono text-[.63rem] uppercase tracking-[.11em] text-admin-muted-2">
            {{ props.user.role }}
          </div>
        </div>
        <div
          class="h-9 w-9 overflow-hidden rounded-[11px] border border-admin-line bg-admin-bg-2"
        >
          <img
            v-if="props.user.avatar"
            :src="props.user.avatar"
            :alt="`Avatar ${props.user.name}`"
            class="h-full w-full object-cover"
          />
          <span
            v-else
            class="grid h-full w-full place-items-center font-mono text-[.7rem] font-bold text-admin-muted"
          >
            {{ props.user.name.charAt(0) }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
