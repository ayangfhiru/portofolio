<script setup lang="ts">
/**
 * Bagian Experience: timeline karier + pendidikan.
 * Data diambil dari `/api/experience`.
 */
import { computed } from "vue";
import { EyebrowLabel } from "~/components/ui";
import type { ApiResponse, Experience } from "~/types";

const { data: experienceResponse } = await useFetch<ApiResponse<Experience[]>>(
  "/api/experience",
);

/** Entri timeline, sesuai urutan yang dikirim API. */
const timeline = computed<Experience[]>(
  () => experienceResponse.value?.data ?? [],
);
</script>

<template>
  <section
    id="experience"
    class="border-y border-line bg-bg-2 py-[112px]"
  >
    <div class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <div
        class="mb-14 flex flex-wrap items-end justify-between gap-7 max-[680px]:mb-[38px]"
      >
        <div v-reveal class="reveal">
          <EyebrowLabel>Career</EyebrowLabel>
          <h2
            class="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.65rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
          >
            Experience &amp;<br /><em class="not-italic text-accent">milestones.</em>
          </h2>
        </div>
        <p v-reveal class="max-w-[38ch] text-[0.98rem] text-muted reveal">
          A path shaped by startups, scale-ups, and a lot of shipped code.
        </p>
      </div>

      <!-- Timeline dengan garis gradien aksen -->
      <ol
        class="relative pl-[34px] before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-px before:bg-gradient-to-b before:from-accent before:to-accent/10"
      >
        <li
          v-for="(item, index) in timeline"
          :key="item.role"
          v-reveal="index * 0.08"
          class="relative pb-[42px] last:pb-0 before:absolute before:-left-[34px] before:top-[7px] before:h-[13px] before:w-[13px] before:rounded-full before:border-2 before:border-accent before:bg-bg-2 reveal"
        >
          <div class="mb-2 flex flex-wrap items-baseline gap-3.5">
            <h3 class="font-display text-[1.36rem] font-bold tracking-[-0.022em]">
              {{ item.role }}
            </h3>
            <span class="font-mono text-[0.72rem] uppercase tracking-[0.11em] text-accent">
              {{ item.dateLabel }}
            </span>
          </div>
          <div class="mb-[11px] text-[0.95rem] font-semibold text-muted">
            {{ item.company }}
          </div>
          <p class="max-w-[62ch] text-[0.945rem] text-muted-2">
            {{ item.description }}
          </p>
          <ul v-if="item.points.length" class="mt-3 grid gap-[7px]">
            <li
              v-for="point in item.points"
              :key="point"
              class="relative pl-[18px] text-[0.92rem] text-muted before:absolute before:left-0 before:top-[9px] before:h-1.5 before:w-1.5 before:rotate-45 before:rounded-[2px] before:bg-accent"
            >
              {{ point }}
            </li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>
