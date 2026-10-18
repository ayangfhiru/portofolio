<script setup lang="ts">
import { Check, X } from "@lucide/vue";
import { useToast } from "~/composables";

/**
 * Penampil notifikasi toast panel admin.
 *
 * Ambil daftar toast dari `useToast()` — cukup letakkan komponen ini
 * sekali di halaman admin, lalu halaman mana pun bisa memanggil
 * `toast.success(...)` / `toast.danger(...)`.
 */

const { toasts, dismiss } = useToast();
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-5 right-5 z-[400] flex flex-col items-end gap-[11px]"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="translate-x-[26px] opacity-0"
      leave-to-class="translate-x-[26px] opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex min-w-[270px] items-center gap-3 rounded-[13px] bg-admin-ink px-[18px] py-3.5 text-sm font-semibold text-white shadow-[0_28px_60px_-22px_rgba(16,24,40,.28)]"
        :role="toast.type === 'danger' ? 'alert' : 'status'"
      >
        <span
          class="grid h-[26px] w-[26px] flex-none place-items-center rounded-lg"
          :class="toast.type === 'danger' ? 'bg-admin-accent' : 'bg-white/15'"
          aria-hidden="true"
        >
          <X v-if="toast.type === 'danger'" class="h-4 w-4" />
          <Check v-else class="h-4 w-4" />
        </span>

        <span class="min-w-0">
          {{ toast.title }}
          <span v-if="toast.description" class="mt-0.5 block text-[.755rem] font-medium opacity-60">
            {{ toast.description }}
          </span>
        </span>

        <button
          type="button"
          aria-label="Tutup notifikasi"
          class="ml-auto flex-none text-white/40 transition-colors hover:text-white"
          @click="dismiss(toast.id)"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
