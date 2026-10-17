<script setup lang="ts">
/**
 * Bagian Services: daftar layanan dengan hover bar aksen + panah.
 * Data diambil dari /api/services.
 */
import { computed } from "vue";
import EyebrowLabel from "~/components/ui/EyebrowLabel.vue";
import type { ApiResponse } from "~/types/api";
import type { Service } from "~/types/service";

const { data: servicesResponse } = await useFetch<ApiResponse<Service[]>>(
  "/api/services",
);

/** Daftar layanan, sudah dilengkapi nomor urut (01, 02, ...). */
const services = computed(() =>
  (servicesResponse.value?.data ?? []).map((service, index) => ({
    ...service,
    index: String(index + 1).padStart(2, "0"),
  })),
);
</script>

<template>
  <section class="pb-[30px] pt-[104px]">
    <div class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <div
        class="mb-14 flex flex-wrap items-end justify-between gap-7 max-[680px]:mb-[38px]"
      >
        <div v-reveal>
          <EyebrowLabel>What I do</EyebrowLabel>
          <h2
            class="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.65rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
          >
            Services built<br />for <em class="not-italic text-accent">shipping.</em>
          </h2>
        </div>
        <p v-reveal class="max-w-[38ch] text-[0.98rem] text-muted">
          End-to-end capability means fewer handoffs, fewer misunderstandings,
          and faster launches.
        </p>
      </div>

      <ul class="border-t border-line">
        <li
          v-for="(service, index) in services"
          :key="service.name"
          v-reveal="index * 0.07"
          class="group relative grid grid-cols-[70px_1.1fr_1.4fr_auto] items-center gap-6 border-b border-line px-[18px] py-7 transition-[background,padding] duration-[400ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:bg-accent/[.045] hover:px-7 max-[980px]:grid-cols-[52px_1fr_auto] max-[980px]:gap-4"
        >
          <!-- Bar aksen yang tumbuh dari atas saat hover -->
          <span
            class="absolute inset-y-0 left-0 w-0.5 origin-bottom scale-y-0 bg-accent transition-transform duration-[450ms] ease-[cubic-bezier(.22,.9,.28,1)] group-hover:origin-top group-hover:scale-y-100"
            aria-hidden="true"
          />
          <span class="font-mono text-[0.8rem] tracking-[0.1em] text-accent">{{
            service.index
          }}</span>
          <span class="font-display text-[1.32rem] font-bold tracking-[-0.02em]">
            {{ service.name }}
          </span>
          <span class="text-[0.92rem] text-muted max-[980px]:hidden">
            {{ service.description }}
          </span>
          <span
            class="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-[400ms] ease-[cubic-bezier(.22,.9,.28,1)] group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-ink"
            aria-hidden="true"
            >↗</span
          >
        </li>
      </ul>
    </div>
  </section>
</template>
