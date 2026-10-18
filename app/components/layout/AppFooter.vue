<script setup lang="ts">
/**
 * Footer: brand, tautan section, meta jam WIB + tahun, tombol back-to-top.
 */
import { useJakartaClock } from "~/composables";
import { getCurrentYear, NAV_LINKS } from "~/utils";

const { clock } = useJakartaClock();
const year = getCurrentYear();
</script>

<template>
  <footer class="border-t border-line pb-[30px] pt-[38px]">
    <div
      class="mx-auto flex w-[min(1240px,100%-48px)] flex-wrap items-center justify-between gap-5 max-[680px]:w-[min(1240px,100%-32px)]"
    >
      <a href="#home" class="flex items-center gap-[11px]">
        <span
          class="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-accent font-mono text-[0.82rem] font-bold text-accent-ink"
          >&lt;/&gt;</span
        >
        <span
          class="font-display text-[1.12rem] font-extrabold tracking-[-0.02em]"
          >ghege.dev</span
        >
      </a>

      <div class="flex flex-wrap gap-5">
        <a
          v-for="link in NAV_LINKS.slice(1)"
          :key="link.href"
          :href="link.href"
          class="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-muted transition-colors duration-300 hover:text-accent"
        >
          {{ link.label }}
        </a>
      </div>

      <p class="font-mono text-[0.73rem] tracking-[0.06em] text-muted-2">
        Jakarta <b class="font-medium text-accent">{{ clock }}</b> · ©
        {{ year }} Syang Ghege
      </p>

      <a
        href="#home"
        aria-label="Back to top"
        class="grid h-[46px] w-[46px] place-items-center rounded-full border border-line-strong transition-all duration-[350ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-1 hover:border-accent hover:bg-accent hover:text-accent-ink"
        >↑</a
      >
    </div>
  </footer>
</template>
