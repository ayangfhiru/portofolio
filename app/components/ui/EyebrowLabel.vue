<script setup lang="ts">
/**
 * Label "eyebrow" di atas judul section:
 * garis pendek + teks mono berwarna aksen.
 */
</script>

<template>
  <span
    class="inline-flex items-center gap-2.5 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent"
  >
    <span class="h-px w-[26px] bg-accent opacity-60" aria-hidden="true" />
    <slot />
  </span>
</template>
