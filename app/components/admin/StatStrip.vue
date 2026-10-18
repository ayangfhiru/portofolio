<script setup lang="ts">
import type { StatItem } from "~/types";

/**
 * Deretan kartu statistik di atas tabel.
 *
 * Warna batang di sisi kiri tiap kartu mengikuti urutan item
 * (merah, hijau, amber, biru) persis seperti desain referensi.
 */

interface Props {
  items: StatItem[];
}

const props = defineProps<Props>();

/** Susunan warna batang — diulang bila jumlah kartu melebihi panjangnya. */
const BAR_CLASSES = [
  "bg-admin-accent",
  "bg-admin-ok",
  "bg-admin-warn",
  "bg-admin-info",
];
</script>

<template>
  <div class="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
    <div
      v-for="(item, index) in props.items"
      :key="item.key"
      class="relative overflow-hidden rounded-[14px] border border-admin-line bg-admin-card p-5 shadow-[0_1px_2px_rgba(16,24,40,.05)] transition-transform duration-300 hover:-translate-y-[3px]"
    >
      <span
        class="absolute inset-y-0 left-0 w-[3px] opacity-90"
        :class="BAR_CLASSES[index % BAR_CLASSES.length]"
        aria-hidden="true"
      />
      <div class="font-mono text-[.64rem] font-bold uppercase tracking-[.15em] text-admin-muted-2">
        {{ item.label }}
      </div>
      <div class="mt-1.5 font-display text-[1.85rem] font-extrabold leading-tight tracking-tight">
        {{ item.value }}
      </div>
      <div v-if="item.hint" class="mt-0.5 text-[.76rem] text-admin-muted">
        {{ item.hint }}
      </div>
    </div>
  </div>
</template>
