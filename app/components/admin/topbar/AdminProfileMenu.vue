<script setup lang="ts">
/**
 * Menu pengguna pada topbar admin: avatar, identitas, dan tautan akun.
 *
 * Keadaan terbuka dipegang `AdminTopbar` lewat prop `open` supaya bisa
 * ditutup bersamaan dengan lapisan lain oleh klik luar maupun Esc.
 */
import { ChevronDown } from "@lucide/vue";
import type { AdminNavLink, AdminUser } from "~/types/admin";

interface Props {
  user: AdminUser;
  links?: AdminNavLink[];
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  links: () => [],
  open: false,
});

const emit = defineEmits<{ toggle: []; navigate: [] }>();
</script>

<template>
  <div class="relative shrink-0">
    <button
      type="button"
      id="topbar-user-button"
      class="flex items-center gap-2 rounded-xl px-3 py-0.5 transition-colors"
      :aria-expanded="props.open"
      aria-controls="topbar-user-menu"
      aria-haspopup="true"
      @click="emit('toggle')"
    >
      <span class="hidden text-right leading-tight sm:block">
        <span class="block text-[.83rem] font-bold">{{ props.user.name }}</span>
        <span
          class="block font-mono text-[.63rem] uppercase tracking-[.11em] text-admin-muted-2"
        >
          {{ props.user.role }}
        </span>
      </span>
      <span
        class="grid h-9 w-9 place-items-center overflow-hidden rounded-[11px] border border-admin-line bg-admin-bg-2"
      >
        <img
          v-if="props.user.avatar"
          :src="props.user.avatar"
          :alt="`Avatar ${props.user.name}`"
          class="h-full w-full object-cover"
        />
        <span v-else class="font-mono text-[.7rem] font-bold text-admin-muted">
          {{ props.user.name.charAt(0) }}
        </span>
      </span>
      <ChevronDown
        class="hidden h-3.5 w-3.5 text-admin-muted transition-transform sm:block"
        :class="props.open ? 'rotate-180' : ''"
      />
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-1 opacity-0"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="translate-y-0 opacity-0"
    >
      <div
        v-if="props.open"
        id="topbar-user-menu"
        role="menu"
        class="absolute right-0 top-[calc(100%+8px)] z-50 w-66.5 overflow-hidden rounded-2xl border border-admin-line bg-admin-card shadow-[0_18px_44px_-18px_rgba(15,23,40,.28)]"
      >
        <div class="border-b border-admin-line px-4 py-3">
          <div class="truncate text-sm font-bold">{{ props.user.name }}</div>
          <div
            class="font-mono text-[.62rem] uppercase tracking-[.12em] text-admin-muted-2"
          >
            {{ props.user.role }}
          </div>
        </div>

        <div class="p-1.5">
          <NuxtLink
            v-for="link in props.links"
            :key="link.key"
            :to="link.to"
            :target="link.isBlank ? '_blank' : ''"
            role="menuitem"
            class="flex items-start gap-3 rounded-xl px-3 py-2.5 text-admin-ink-2 transition-colors hover:bg-admin-bg-2"
            @click="emit('navigate')"
          >
            <component
              :is="link.icon"
              v-if="link.icon"
              class="mt-0.5 h-4 w-4 shrink-0"
            />
            <span class="min-w-0">
              <span class="block text-sm font-semibold">{{ link.label }}</span>
              <span
                v-if="link.description"
                class="block text-xs text-admin-muted"
              >
                {{ link.description }}
              </span>
            </span>
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
