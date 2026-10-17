<script setup lang="ts">
/**
 * Bagian Quote: testimonial client dalam kotak gradien.
 *
 * Testimonial diambil dari `/api/testimonial` (hanya yang `active`).
 * Teks quote memuat penanda `**penekanan**` untuk frasa berwarna aksen.
 */
import { computed } from "vue";
import { splitEmphasis } from "~/utils/format";
import type { ApiResponse } from "~/types/api";
import type { Testimonial } from "~/types/testimonial";

const { data: testimonialResponse } = await useFetch<ApiResponse<Testimonial[]>>(
  "/api/testimonial",
);

/** Testimonial pertama yang aktif — bagian Quote hanya menampilkan satu. */
const testimonial = computed<Testimonial | null>(
  () => testimonialResponse.value?.data?.[0] ?? null,
);

/** Bagian teks quote, sudah dipisah berdasarkan penanda penekanan. */
const quoteParts = computed(() =>
  splitEmphasis(testimonial.value?.quote ?? ""),
);
</script>

<template>
  <section class="py-[112px]">
    <div class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <!-- Empty state: tidak ada testimonial aktif -->
      <p
        v-if="!testimonial"
        class="text-center font-mono text-[0.8rem] uppercase tracking-[0.14em] text-muted-2"
      >
        Belum ada testimonial.
      </p>

      <figure
        v-else
        v-reveal
        class="relative overflow-hidden rounded-[26px] border border-line px-[clamp(26px,5vw,66px)] py-[60px] max-[680px]:px-[22px] max-[680px]:py-[42px]"
        style="
          background:
            radial-gradient(ellipse at 88% 12%, rgba(214, 255, 74, 0.11), transparent 55%),
            var(--color-surface);
        "
      >
        <span
          class="pointer-events-none absolute -top-[38px] right-[26px] font-display text-[15rem] font-extrabold leading-none text-accent/10 max-[680px]:-top-3.5 max-[680px]:right-2.5 max-[680px]:text-[9rem]"
          aria-hidden="true"
          >”</span
        >

        <blockquote
          class="relative max-w-[22ch] font-display text-[clamp(1.42rem,3.1vw,2.15rem)] font-semibold leading-[1.36] tracking-[-0.022em]"
        >
          <template v-for="(part, index) in quoteParts" :key="index">
            <em v-if="part.emphasized" class="not-italic text-accent">{{
              part.text
            }}</em>
            <template v-else>{{ part.text }}</template>
          </template>
        </blockquote>

        <figcaption class="mt-[34px] flex items-center gap-[15px]">
          <img
            loading="lazy"
            :src="testimonial.authorImage"
            :alt="`Portrait of ${testimonial.authorName}`"
            class="h-[52px] w-[52px] rounded-full border-[1.6px] border-accent object-cover"
          />
          <div>
            <div class="font-bold">{{ testimonial.authorName }}</div>
            <div class="font-mono text-[0.72rem] uppercase tracking-[0.11em] text-muted-2">
              {{ testimonial.authorRole }}
            </div>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
