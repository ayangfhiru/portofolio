<script setup lang="ts">
/**
 * Bagian Contact: judul raksasa, CTA email/call, kartu info, sosial.
 *
 * Data dinamis:
 * - `/api/profile` → subjudul, email, tautan book-a-call
 * - `/api/contact` → kartu informasi + tautan sosial media
 *
 * `value` pada kartu memuat penanda `**penekanan**` untuk frasa aksen.
 */
import { computed } from "vue";
import AppButton from "~/components/ui/AppButton.vue";
import { splitEmphasis } from "~/utils/format";
import type { ApiResponse } from "~/types/api";
import type { Profile } from "~/types/profile";
import type { ContactCard, SocialLink } from "~/types/contact";

interface ContactPayload {
  cards: ContactCard[];
  socials: SocialLink[];
}

const { data: profileResponse } = await useFetch<ApiResponse<Profile>>(
  "/api/profile",
);
const { data: contactResponse } = await useFetch<ApiResponse<ContactPayload>>(
  "/api/contact",
);

const profile = computed<Profile | null>(
  () => profileResponse.value?.data ?? null,
);
const cards = computed<ContactCard[]>(
  () => contactResponse.value?.data?.cards ?? [],
);
const socials = computed<SocialLink[]>(
  () => contactResponse.value?.data?.socials ?? [],
);

/** Pecah tiap kartu menjadi bagian teks siap render. */
const cardParts = computed(() =>
  cards.value.map((card) => ({ ...card, parts: splitEmphasis(card.value) })),
);
</script>

<template>
  <section id="contact" class="relative overflow-hidden px-0 pb-24 pt-[120px]">
    <!-- Glow latar -->
    <div
      class="pointer-events-none absolute left-1/2 top-[8%] h-[620px] w-[900px] -translate-x-1/2"
      style="
        background: radial-gradient(ellipse, rgba(214, 255, 74, 0.1), transparent 62%);
      "
      aria-hidden="true"
    />

    <div class="relative mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <h2
        v-reveal
        class="text-center font-display text-[clamp(2.65rem,9vw,7.4rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
      >
        LET'S BUILD<br />
        <span class="text-transparent [-webkit-text-stroke:1.5px_var(--color-line-strong)]"
          >SOMETHING</span
        >
        <span class="text-accent">GOOD.</span>
      </h2>

      <p
        v-reveal="0.1"
        class="mx-auto mb-10 mt-[26px] max-w-[50ch] text-center text-[1.06rem] text-muted"
      >
        {{ profile?.contactSubtitle }}
      </p>

      <div v-reveal="0.18" class="mb-[52px] flex flex-wrap justify-center gap-3.5">
        <AppButton :href="`mailto:${profile?.contactEmail ?? ''}`" variant="mail">
          {{ profile?.contactEmail }}
        </AppButton>
        <AppButton
          variant="ghost"
          :href="profile?.contactCallUrl ?? '#'"
          class="px-[30px] py-[19px]"
        >
          Book a call
        </AppButton>
      </div>

      <div class="relative grid grid-cols-3 gap-4 max-[980px]:grid-cols-1">
        <div
          v-for="(card, index) in cardParts"
          :key="card.key"
          v-reveal="index * 0.08"
          class="rounded-[18px] border border-line bg-surface/[.66] p-6 backdrop-blur-lg transition-all duration-[450ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-1.5 hover:border-accent/[.36]"
        >
          <div class="font-mono text-[0.68rem] uppercase tracking-[0.15em] text-muted-2">
            {{ card.key }}
          </div>
          <div class="mt-[9px] break-words font-display text-[1.16rem] font-bold tracking-[-0.018em]">
            <template v-for="(part, i) in card.parts" :key="i">
              <span v-if="part.emphasized" class="text-accent">{{ part.text }}</span>
              <template v-else>{{ part.text }}</template>
            </template>
          </div>
        </div>
      </div>

      <div v-reveal="0.22" class="mt-[34px] flex flex-wrap justify-center gap-2.5">
        <a
          v-for="social in socials"
          :key="social.label"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full border border-line px-[18px] py-2.5 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-muted transition-all duration-[320ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-[3px] hover:border-accent hover:bg-accent hover:text-accent-ink"
        >
          {{ social.label }}
        </a>
      </div>
    </div>
  </section>
</template>
