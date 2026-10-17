<script setup lang="ts">
/**
 * Hero: headline dengan kata berputar, foto + chip melayang,
 * statistik counter, spotlight mengikuti kursor, dan marquee stack.
 *
 * Data dinamis diambil dari API:
 * - /api/profile → teks hero, foto, kata berputar
 * - /api/stats   → angka counter
 *
 * Marquee & chip melayang tetap statis karena murni dekoratif.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import AppButton from "~/components/ui/AppButton.vue";
import { splitEmphasis } from "~/utils/format";
import type { ApiResponse } from "~/types/api";
import type { Profile, Stat } from "~/types/profile";

/** Kata berputar cadangan bila API belum mengembalikan data. */
const DEFAULT_ROTATING_WORDS = ["ship fast."];

/** Marquee dekoratif (teknologi yang dikuasai). */
const MARQUEE_ITEMS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Go",
  "PostgreSQL",
  "GraphQL",
  "Docker",
  "AWS",
  "Redis",
  "Tailwind",
  "Kubernetes",
];

/** Chip melayang di sekitar foto. */
const FLOAT_CHIPS = [
  {
    initial: "R",
    label: "React 19",
    iconClass: "bg-[#61DAFB] text-accent-ink",
    positionClass: "top-[8%] -left-[8%] max-[680px]:-left-[4%]",
    delayClass: "[-animation-delay:-1s]",
  },
  {
    initial: "TS",
    label: "TypeScript",
    iconClass: "bg-[#3178C6] text-white",
    positionClass: "top-[42%] -right-[9%] max-[680px]:-right-[4%]",
    delayClass: "[-animation-delay:-3s]",
  },
  {
    initial: "N",
    label: "Node.js",
    iconClass: "bg-[#8CC84B] text-accent-ink",
    positionClass: "bottom-[15%] -left-[11%] max-[680px]:-left-[4%]",
    delayClass: "[-animation-delay:-5s]",
  },
];

// --- Ambil data dinamis -----------------------------------------------------
const { data: profileResponse } = await useFetch<ApiResponse<Profile>>(
  "/api/profile",
);
const { data: statsResponse } = await useFetch<ApiResponse<Stat[]>>("/api/stats");

const profile = computed<Profile | null>(
  () => profileResponse.value?.data ?? null,
);
const stats = computed<Stat[]>(() => statsResponse.value?.data ?? []);

const rotatingWords = computed<string[]>(() =>
  profile.value?.rotatingWords?.length
    ? profile.value.rotatingWords
    : DEFAULT_ROTATING_WORDS,
);

/**
 * Bagian teks lead, dipecah berdasarkan penanda `**penekanan**`
 * agar frasa "6+ years" tampil tebal (lihat `splitEmphasis`).
 */
const leadParts = computed(() => splitEmphasis(profile.value?.heroLead ?? ""));

// --- State interaktif -------------------------------------------------------
const heroRef = ref<HTMLElement | null>(null);
const spotlightStyle = ref({ left: "30%", top: "30%", opacity: 0 });

const rotatingIndex = ref(0);
const rotatingClass = ref("");

/** Nilai counter per statistik (diisi saat animasi berjalan). */
const counters = ref<number[]>(stats.value.map(() => 0));

let rotateTimer: ReturnType<typeof setInterval> | undefined;
let counterObserver: IntersectionObserver | undefined;

const handleHeroMouseMove = (event: MouseEvent) => {
  if (!heroRef.value) return;
  if (!window.matchMedia("(hover: hover)").matches) return;

  const rect = heroRef.value.getBoundingClientRect();
  spotlightStyle.value = {
    left: `${event.clientX - rect.left}px`,
    top: `${event.clientY - rect.top}px`,
    opacity: 1,
  };
};

const handleHeroMouseLeave = () => {
  spotlightStyle.value = { ...spotlightStyle.value, opacity: 0 };
};

onMounted(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* Rotating headline */
  if (!reducedMotion) {
    rotateTimer = setInterval(() => {
      rotatingClass.value = "out";
      setTimeout(() => {
        rotatingIndex.value =
          (rotatingIndex.value + 1) % rotatingWords.value.length;
        rotatingClass.value = "in";
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (rotatingClass.value = "")),
        );
      }, 420);
    }, 2800);
  }

  /* Counter animasi */
  const animateCount = (index: number) => {
    const target = stats.value[index]?.value ?? 0;
    const duration = 1500;
    const start = performance.now();

    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      counters.value[index] = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else counters.value[index] = target;
    };
    requestAnimationFrame(step);
  };

  const countEls = document.querySelectorAll<HTMLElement>(".count");

  if (!reducedMotion && "IntersectionObserver" in window) {
    counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index ?? 0);
            animateCount(index);
            counterObserver?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    countEls.forEach((el) => counterObserver?.observe(el));
  } else {
    counters.value = stats.value.map((stat) => stat.value);
  }
});

onUnmounted(() => {
  if (rotateTimer) clearInterval(rotateTimer);
  counterObserver?.disconnect();
});
</script>

<template>
  <section
    id="home"
    ref="heroRef"
    class="relative overflow-hidden px-0 pb-[70px] pt-40 max-[980px]:pt-[132px]"
    @mousemove="handleHeroMouseMove"
    @mouseleave="handleHeroMouseLeave"
  >
    <!-- Dekorasi latar -->
    <div
      class="pointer-events-none absolute inset-0"
      style="
        background:
          linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
        background-size: 72px 72px;
        mask-image: radial-gradient(ellipse 85% 70% at 30% 25%, #000 20%, transparent 78%);
        -webkit-mask-image: radial-gradient(ellipse 85% 70% at 30% 25%, #000 20%, transparent 78%);
      "
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-[260px] -top-[280px] h-[820px] w-[820px]"
      style="
        background: radial-gradient(circle, rgba(214, 255, 74, 0.13), transparent 62%);
      "
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-[320px] -left-[240px] h-[620px] w-[620px]"
      style="
        background: radial-gradient(circle, rgba(255, 91, 57, 0.11), transparent 65%);
      "
      aria-hidden="true"
    />
    <!-- Spotlight mengikuti kursor -->
    <div
      class="pointer-events-none absolute h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[600ms]"
      style="
        background: radial-gradient(circle, rgba(214, 255, 74, 0.11), transparent 68%);
      "
      :style="{
        left: spotlightStyle.left,
        top: spotlightStyle.top,
        opacity: spotlightStyle.opacity,
      }"
      aria-hidden="true"
    />

    <div
      class="relative mx-auto grid w-[min(1240px,100%-48px)] grid-cols-[1.09fr_.91fr] items-center gap-[60px] max-[1100px]:gap-11 max-[980px]:grid-cols-1 max-[980px]:gap-[52px] max-[680px]:w-[min(1240px,100%-32px)]"
    >
      <!-- Kolom kiri -->
      <div>
        <div
          v-reveal
          class="inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-white/[0.03] py-2 pl-2.5 pr-4 font-mono text-[0.72rem] uppercase tracking-[0.09em] text-muted"
        >
          <span class="relative h-2 w-2 rounded-full bg-accent">
            <span
              class="absolute -inset-1 rounded-full border border-accent"
              style="animation: pulse-ring 2s infinite"
              aria-hidden="true"
            />
          </span>
          {{ profile?.availabilityText ?? "" }}
        </div>

        <h1
          v-reveal="0.08"
          class="my-6 font-display text-[clamp(2.75rem,7.1vw,5.35rem)] font-extrabold leading-[0.94] tracking-[-0.035em]"
        >
          I build digital<br />
          products that<br />
          <span
            class="relative inline-block h-[1.02em] min-w-[6.4em] overflow-hidden align-bottom"
          >
            <span class="rot-word" :class="rotatingClass">{{
              rotatingWords[rotatingIndex]
            }}</span>
          </span>
        </h1>

        <p v-reveal="0.16" class="mb-[34px] max-w-[47ch] text-[1.07rem] text-muted">
          <template v-for="(part, i) in leadParts" :key="i">
            <strong v-if="part.emphasized" class="font-semibold text-ink">{{
              part.text
            }}</strong>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>

        <div v-reveal="0.24" class="mb-[46px] flex flex-wrap gap-3.5">
          <AppButton href="#work">View selected work</AppButton>
          <AppButton variant="ghost" href="#contact" :magnetic="false">
            Let's talk
          </AppButton>
        </div>

        <div
          v-reveal="0.32"
          class="grid max-w-[560px] grid-cols-4 gap-[18px] border-t border-line pt-[26px] max-[980px]:max-w-none max-[680px]:grid-cols-2 max-[680px]:gap-x-4 max-[680px]:gap-y-[22px]"
        >
          <div v-for="(stat, index) in stats" :key="stat.label">
            <div
              class="font-display text-[1.85rem] font-extrabold leading-none tracking-[-0.03em]"
            >
              <span class="count" :data-target="stat.value" :data-index="index">{{
                counters[index] ?? 0
              }}</span
              ><span v-if="stat.suffix" class="text-[1.15rem] text-accent">{{
                stat.suffix
              }}</span>
            </div>
            <div
              class="mt-[7px] font-mono text-[0.68rem] uppercase tracking-[0.13em] text-muted-2"
            >
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom kanan: foto -->
      <div
        v-reveal="0.2"
        class="relative p-3.5 max-[980px]:mx-auto max-[980px]:w-full max-[980px]:max-w-[520px]"
      >
        <div
          class="relative aspect-[4/4.55] overflow-hidden rounded-[26px] bg-surface shadow-[0_40px_90px_-30px_rgba(0,0,0,.85)]"
        >
          <span
            class="absolute left-0 top-0 h-[74px] w-[74px] rounded-2xl border-[1.6px] border-accent border-b-0 border-r-0 opacity-65"
            aria-hidden="true"
          />
          <span
            class="absolute bottom-0 right-0 h-[74px] w-[74px] rounded-2xl border-[1.6px] border-accent border-l-0 border-t-0 opacity-65"
            aria-hidden="true"
          />
          <img
            :src="profile?.photoUrl ?? ''"
            :alt="`Portrait of ${profile?.fullName ?? ''}`"
            class="h-full w-full object-cover grayscale-[.28] contrast-[1.08] saturate-[.92] transition-[filter,transform] duration-[900ms] ease-[cubic-bezier(.22,.9,.28,1)] group-hover:grayscale-0"
          />
          <div
            class="pointer-events-none absolute inset-0"
            style="
              background: linear-gradient(180deg, rgba(10, 11, 13, 0) 42%, rgba(10, 11, 13, 0.82) 100%);
            "
            aria-hidden="true"
          />
          <div
            class="absolute inset-x-4 bottom-4 z-[3] flex items-center justify-between gap-3 rounded-[14px] border border-line bg-bg/55 px-4 py-[13px] backdrop-blur-md"
          >
            <div>
              <div class="font-display text-base font-bold">
                {{ profile?.fullName }}
              </div>
              <div
                class="font-mono text-[0.68rem] uppercase tracking-[0.11em] text-accent"
              >
                {{ profile?.role }}
              </div>
            </div>
            <div class="font-mono text-[0.72rem] text-muted">
              {{ profile?.photoTagline }}
            </div>
          </div>
        </div>

        <!-- Chip melayang -->
        <div
          v-for="chip in FLOAT_CHIPS"
          :key="chip.label"
          class="absolute z-[5] flex items-center gap-2 rounded-[13px] border border-line-strong bg-surface/95 px-[15px] py-2.5 font-mono text-[0.74rem] shadow-[0_18px_40px_-18px_rgba(0,0,0,.8)] [animation:floaty_6s_ease-in-out_infinite] max-[680px]:px-3 max-[680px]:py-2 max-[680px]:text-[0.68rem]"
          :class="[chip.positionClass, chip.delayClass]"
        >
          <span
            class="grid h-[22px] w-[22px] place-items-center rounded-[7px] text-[0.66rem] font-bold"
            :class="chip.iconClass"
            >{{ chip.initial }}</span
          >
          {{ chip.label }}
        </div>
      </div>
    </div>

    <!-- Marquee -->
    <div class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <div
        class="group relative mt-[76px] overflow-hidden border-y border-line py-[22px]"
        style="
          mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 9%, #000 91%, transparent);
        "
      >
        <div class="marquee-track group-hover:[animation-play-state:paused]">
          <div
            v-for="copy in 2"
            :key="copy"
            class="flex items-center gap-[52px] font-display text-[1.28rem] font-bold tracking-[-0.015em] text-ink/40 whitespace-nowrap"
            :aria-hidden="copy === 2"
          >
            <template v-for="item in MARQUEE_ITEMS" :key="item">
              {{ item }}
              <i
                class="inline-block h-[7px] w-[7px] rounded-full bg-accent opacity-75"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
