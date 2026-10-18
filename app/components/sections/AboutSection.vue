<script setup lang="ts">
/**
 * Bagian About: foto workspace + badge, paragraf bio, facts grid, dan CTA.
 *
 * Data dinamis:
 * - `/api/profile` → catatan singkat, paragraf bio, badge
 * - `/api/facts`    → grid fakta (Based in, Timezone, ...)
 *
 * Paragraf & fakta memuat penanda `**penekanan**` untuk frasa yang
 * ditampilkan tebal/berwarna (lihat `splitEmphasis`).
 */
import { computed } from "vue";
import { AppButton, EyebrowLabel } from "~/components/ui";
import type { AboutFact, ApiResponse, Profile } from "~/types";
import { splitEmphasis } from "~/utils";

const { data: profileResponse } =
  await useFetch<ApiResponse<Profile>>("/api/profile");
const { data: factsResponse } =
  await useFetch<ApiResponse<AboutFact[]>>("/api/facts");

const profile = computed<Profile | null>(
  () => profileResponse.value?.data ?? null,
);

/** Paragraf bio, masing-masing sudah dipecah berdasarkan penanda penekanan. */
const paragraphParts = computed(() =>
  (profile.value?.aboutParagraphs ?? []).map((paragraph) =>
    splitEmphasis(paragraph),
  ),
);

/** Fakta About, nilainya sudah dipecah berdasarkan penanda penekanan. */
const facts = computed(() =>
  (factsResponse.value?.data ?? []).map((fact) => ({
    ...fact,
    parts: splitEmphasis(fact.value),
  })),
);
</script>

<template>
  <section id="about" class="relative pb-[30px] pt-[120px]">
    <div
      class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]"
    >
      <div
        class="mb-14 flex flex-wrap items-end justify-between gap-7 max-[680px]:mb-[38px]"
      >
        <div v-reveal class="reveal">
          <EyebrowLabel>About me</EyebrowLabel>
          <h2
            class="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.65rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
          >
            Engineering with<br /><em class="not-italic text-accent"
              >design sensibility.</em
            >
          </h2>
        </div>
        <p v-reveal class="max-w-[38ch] text-[0.98rem] text-muted reveal">
          {{ profile?.aboutNote }}
        </p>
      </div>

      <div
        class="grid grid-cols-[.95fr_1.05fr] items-start gap-[70px] max-[980px]:grid-cols-1 max-[980px]:gap-[52px]"
      >
        <!-- Visual -->
        <div v-reveal class="relative max-[980px]:max-w-[560px] reveal">
          <div class="aspect-[4/3.4] overflow-hidden rounded-[26px] bg-surface">
            <img
              loading="lazy"
              src="/images/portfolio/about-workspace.png"
              alt="Workspace with code on screen"
              class="h-full w-full object-cover grayscale-[.35] contrast-[1.06]"
            />
          </div>
          <div
            class="absolute -bottom-[22px] -right-4 max-w-[212px] rounded-[20px] bg-accent p-[22px] text-accent-ink shadow-[0_30px_60px_-22px_rgba(214,255,74,.35)] max-[980px]:right-0"
          >
            <div
              class="font-display text-[2.35rem] font-extrabold leading-none tracking-[-0.03em]"
            >
              {{ profile?.badgeValue }}
            </div>
            <div
              class="mt-1.5 font-mono text-[0.7rem] uppercase tracking-[0.11em] opacity-[.78]"
            >
              {{ profile?.badgeLabel }}
            </div>
          </div>
        </div>

        <!-- Copy -->
        <div>
          <p
            v-for="(parts, index) in paragraphParts"
            :key="index"
            v-reveal="index * 0.08"
            class="mb-4.5 text-[1.045rem] text-muted reveal"
          >
            <template v-for="(part, i) in parts" :key="i">
              <strong v-if="part.emphasized" class="font-semibold text-ink">{{
                part.text
              }}</strong>
              <template v-else>{{ part.text }}</template>
            </template>
          </p>

          <!-- Empty state -->
          <p
            v-if="!paragraphParts.length"
            class="mb-4.5 text-[1.045rem] text-muted-2"
          >
            Bio belum tersedia.
          </p>

          <dl
            v-reveal="0.22"
            class="my-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line max-[680px]:grid-cols-1 reveal"
          >
            <div v-for="fact in facts" :key="fact.term" class="bg-bg-2 p-5">
              <dt
                class="font-mono text-[0.67rem] uppercase tracking-[0.14em] text-muted-2"
              >
                {{ fact.term }}
              </dt>
              <dd class="mt-1.5 text-[0.97rem] font-semibold">
                <template v-for="(part, i) in fact.parts" :key="i">
                  <span v-if="part.emphasized" class="text-accent">{{
                    part.text
                  }}</span>
                  <template v-else>{{ part.text }}</template>
                </template>
              </dd>
            </div>
          </dl>

          <div v-reveal="0.28" class="reveal">
            <AppButton variant="ghost" href="#contact">
              More about my journey
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
