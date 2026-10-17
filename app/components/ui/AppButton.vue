<script setup lang="ts">
/**
 * Tombol utama desain portfolio.
 * - primary : latar aksen, teks gelap
 * - ghost   : border tipis, teks terang
 * - mail    : variant besar untuk CTA email
 *
 * Semua variant menerapkan efek magnetic & panah hover
 * seperti desain aslinya.
 */
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "primary" | "ghost" | "mail";
    href?: string;
    type?: "button" | "submit";
    magnetic?: boolean;
  }>(),
  { variant: "primary", magnetic: true, type: "button" },
);

const el = ref<HTMLElement | null>(null);

const handleMouseMove = (event: MouseEvent) => {
  if (!props.magnetic || !el.value) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = el.value.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  el.value.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
};

const handleMouseLeave = () => {
  if (el.value) el.value.style.transform = "";
};

const variantClasses: Record<string, string> = {
  primary:
    "bg-accent text-accent-ink hover:-translate-y-[3px] hover:tracking-[0.05em]",
  ghost:
    "border border-line-strong text-ink hover:border-accent hover:text-accent hover:-translate-y-[3px]",
  mail: "bg-accent text-accent-ink font-extrabold text-base px-[34px] py-[19px] hover:-translate-y-1 hover:scale-[1.02] hover:tracking-[0.05em]",
};
</script>

<template>
  <a
    v-if="props.href"
    :href="props.href"
    ref="el"
    class="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-[22px] py-[13px] text-[0.88rem] font-bold tracking-[0.01em] transition-[transform,background,color,border-color,letter-spacing] duration-300 ease-[cubic-bezier(.22,.9,.28,1)] will-change-transform"
    :class="variantClasses[props.variant]"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <slot />
    <slot name="arrow">
      <span
        class="inline-block transition-transform duration-300 ease-[cubic-bezier(.22,.9,.28,1)] group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
        aria-hidden="true"
        >↗</span
      >
    </slot>
  </a>

  <button
    v-else
    :type="props.type"
    ref="el"
    class="group inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-[22px] py-[13px] text-[0.88rem] font-bold tracking-[0.01em] transition-[transform,background,color,border-color,letter-spacing] duration-300 ease-[cubic-bezier(.22,.9,.28,1)] will-change-transform"
    :class="variantClasses[props.variant]"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <slot />
  </button>
</template>
