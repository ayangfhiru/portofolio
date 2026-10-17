<script setup lang="ts">
/**
 * Panah ↗ (↗) atau → yang bergerak saat hover induknya.
 * Dipakai di dalam tombol/link ber-pattern `.btn` dan project-link.
 */
withDefaults(defineProps<{ direction?: "ne" | "e" }>(), {
  direction: "ne",
});
</script>

<template>
  <span
    class="inline-block transition-transform duration-300 ease-[cubic-bezier(.22,.9,.28,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
    :class="direction === 'e' && 'group-hover:!translate-x-1.5 group-hover:!translate-y-0'"
    aria-hidden="true"
  >
    {{ direction === "e" ? "→" : "↗" }}
  </span>
</template>
