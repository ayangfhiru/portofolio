<script setup lang="ts">
/**
 * Panel menu mobile full-screen (slide-down clip-path).
 * Ditutup otomatis saat salah satu link diklik.
 */
import { NAV_LINKS } from "~/utils/navigation";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div
    class="fixed inset-0 z-[880] flex flex-col gap-1.5 bg-bg-2 px-[26px] pb-10 pt-[110px] transition-[clip-path] duration-[600ms] ease-[cubic-bezier(.22,.9,.28,1)] max-[680px]:px-[26px]"
    :style="{ clipPath: props.open ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)' }"
    :aria-hidden="!props.open"
    @click="emit('close')"
  >
    <a
      v-for="(link, index) in NAV_LINKS"
      :key="link.href"
      :href="link.href"
      class="flex items-center justify-between border-b border-line py-3 font-display text-[2rem] font-bold tracking-[-0.02em] max-[680px]:text-[1.62rem]"
    >
      {{ link.label }}
      <span class="font-mono text-[0.72rem] font-normal text-accent">{{
        String(index + 1).padStart(2, "0")
      }}</span>
    </a>

    <div
      class="mt-auto border-t border-line pt-[26px] font-mono text-[0.76rem] text-muted"
    >
      <div>Jakarta, Indonesia — Open for freelance</div>
      <div class="mt-2 text-accent">hello@rakadevano.dev</div>
    </div>
  </div>
</template>
