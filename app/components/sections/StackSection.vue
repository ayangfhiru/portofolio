<script setup lang="ts">
/**
 * Bagian Stack: kartu kategori teknologi + terminal yang
 * mengetik konfigurasi developer secara otomatis.
 *
 * Grup & item teknologi diambil dari `/api/stack`.
 * Baris terminal tetap statis karena murni dekoratif.
 */
import { computed, onMounted, onUnmounted, ref } from "vue";
import EyebrowLabel from "~/components/ui/EyebrowLabel.vue";
import type { ApiResponse } from "~/types/api";
import type { StackGroup } from "~/types/stack";

const { data: stackResponse } = await useFetch<ApiResponse<StackGroup[]>>(
  "/api/stack",
);

/** Grup teknologi yang ditampilkan pada kartu. */
const stackGroups = computed<StackGroup[]>(() => stackResponse.value?.data ?? []);

/** Baris terminal dengan markup sintaks highlight. */
const TERMINAL_LINES = [
  '<span class="text-muted-2">// raka.config.ts</span>',
  '<span class="text-[#FF7B63]">export const</span> <span class="text-[#79C0FF]">developer</span> = {',
  '  <span class="text-[#79C0FF]">name</span>: <span class="text-accent">"Raka Devano"</span>,',
  '  <span class="text-[#79C0FF]">role</span>: <span class="text-accent">"Full-Stack Engineer"</span>,',
  '  <span class="text-[#79C0FF]">focus</span>: [<span class="text-accent">"product"</span>, <span class="text-accent">"performance"</span>, <span class="text-accent">"craft"</span>],',
  '  <span class="text-[#79C0FF]">stack</span>: {',
  '    <span class="text-[#79C0FF]">frontend</span>: <span class="text-accent">"React + TypeScript"</span>,',
  '    <span class="text-[#79C0FF]">backend</span>: <span class="text-accent">"Node.js / Go"</span>,',
  '    <span class="text-[#79C0FF]">cloud</span>: <span class="text-accent">"AWS + Kubernetes"</span>,',
  "  },",
  '  <span class="text-[#79C0FF]">openToWork</span>: <span class="text-[#D2A8FF]">true</span>,',
  "};",
];

const termRef = ref<HTMLElement | null>(null);

/** State terminal: daftar baris yang sudah "selesai" diketik. */
const typedLines = ref<string[]>([]);
const showCaret = ref(false);

onMounted(() => {
  const el = termRef.value;
  if (!el) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const renderAll = () => {
    typedLines.value = [...TERMINAL_LINES];
    showCaret.value = true;
  };

  if (reducedMotion || !("IntersectionObserver" in window)) {
    renderAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
        typeSequentially();
      });
    },
    { threshold: 0.3 },
  );
  observer.observe(el);

  onUnmounted(() => observer.disconnect());

  /** Ketik baris demi baris, karakter demi karakter (tag HTML dilewati). */
  function typeSequentially() {
    let lineIndex = 0;

    const typeLine = () => {
      if (lineIndex >= TERMINAL_LINES.length) {
        showCaret.value = true;
        return;
      }

      const raw = TERMINAL_LINES[lineIndex] ?? "";
      const tokens = raw.match(/<[^>]+>|&[a-z]+;|./gi) ?? [];
      let buffer = "";

      const tick = () => {
        if (tokens.length === 0) {
          typedLines.value[lineIndex] = buffer;
          lineIndex += 1;
          setTimeout(typeLine, 160);
          return;
        }

        const token = tokens.shift();
        if (token === undefined) return;
        buffer += token;
        typedLines.value[lineIndex] = buffer;

        const isTag = token.startsWith("<");
        setTimeout(tick, isTag ? 0 : 14);
      };

      typedLines.value[lineIndex] = "";
      tick();
    };

    typeLine();
  }
});
</script>

<template>
  <section id="stack" class="py-[118px]">
    <div class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <div
        class="mb-14 flex flex-wrap items-end justify-between gap-7 max-[680px]:mb-[38px]"
      >
        <div v-reveal>
          <EyebrowLabel>Toolkit</EyebrowLabel>
          <h2
            class="mt-4 font-display text-[clamp(2.1rem,5.2vw,3.65rem)] font-extrabold leading-[0.98] tracking-[-0.025em]"
          >
            Languages &amp;<br /><em class="not-italic text-accent">frameworks.</em>
          </h2>
        </div>
        <p v-reveal class="max-w-[38ch] text-[0.98rem] text-muted">
          The stack I reach for daily — chosen for velocity, maintainability and
          developer happiness.
        </p>
      </div>

      <div
        class="grid grid-cols-[1.12fr_.88fr] items-stretch gap-[56px] max-[1100px]:grid-cols-1"
      >
        <!-- Kartu stack -->
        <div class="grid grid-cols-2 gap-4 max-[680px]:grid-cols-1">
          <div
            v-for="(group, index) in stackGroups"
            :key="group.title"
            v-reveal="index * 0.07"
            class="rounded-[18px] border border-line bg-surface p-6 transition-[transform,border-color,background] duration-[450ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-[7px] hover:border-accent/40 hover:bg-surface-2"
          >
            <h3 class="mb-4 flex items-center gap-2.5 font-display text-[1.06rem] font-bold tracking-[-0.015em]">
              <span
                class="h-[9px] w-[9px] rotate-45 rounded-sm bg-accent"
                aria-hidden="true"
              />
              {{ group.title }}
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in group.items"
                :key="item"
                class="rounded-[9px] border border-line bg-white/[0.045] px-3 py-[7px] font-mono text-[0.72rem] text-muted transition-all duration-300 ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-accent-ink"
              >
                {{ item }}
              </span>
            </div>
          </div>
        </div>

        <!-- Terminal -->
        <div
          v-reveal="0.12"
          class="flex min-h-full flex-col overflow-hidden rounded-[18px] border border-line bg-[#08090B] shadow-[0_40px_80px_-34px_rgba(0,0,0,.9)]"
        >
          <div class="flex items-center gap-2 border-b border-line bg-white/[0.025] px-4 py-[13px]">
            <i class="block h-[11px] w-[11px] rounded-full bg-[#FF5F57]" />
            <i class="block h-[11px] w-[11px] rounded-full bg-[#FEBC2E]" />
            <i class="block h-[11px] w-[11px] rounded-full bg-[#28C840]" />
            <span class="ml-2.5 font-mono text-[0.72rem] text-muted-2"
              >~/raka/stack.ts</span
            >
          </div>
          <div
            ref="termRef"
            class="flex-1 px-5 py-[22px] font-mono text-[0.815rem] leading-[1.95]"
          >
            <div
              v-for="(line, index) in typedLines"
              :key="index"
              class="break-words whitespace-pre-wrap"
              v-html="line"
            />
            <span
              v-if="showCaret"
              class="inline-block h-[15px] w-2 -translate-y-0.5 bg-accent align-middle [animation:blink_1s_steps(2)_infinite]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
