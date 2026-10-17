<script setup lang="ts">
/**
 * Header bagian section: judul besar + eyebrow + catatan samping.
 * Slot `title` untuk judul (boleh memuat `<em>`), `note` opsional.
 */
import EyebrowLabel from "~/components/ui/EyebrowLabel.vue";

defineProps<{ eyebrow: string; note?: string }>();
</script>

<template>
  <div
    class="mb-14 flex flex-wrap items-end justify-between gap-7 max-[680px]:mb-[38px]"
  >
    <div v-reveal>
      <EyebrowLabel>{{ eyebrow }}</EyebrowLabel>
      <h2
        class="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.65rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
      >
        <slot name="title" />
      </h2>
    </div>

    <p v-if="note" v-reveal class="max-w-[38ch] text-[0.98rem] text-muted">
      {{ note }}
    </p>

    <slot name="actions" />
  </div>
</template>
