<script setup lang="ts">
/**
 * Kartu project tunggal.
 * - `featured` : layout split besar (label + judul besar + link di bawah)
 * - default    : kartu grid (judul + tahun di atas, link di bawah)
 */
import type { ProjectItem } from "~/types/project";

defineProps<{ project: ProjectItem; featured?: boolean }>();
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-[26px] border border-line bg-surface transition-[transform,border-color] duration-[550ms] ease-[cubic-bezier(.22,.9,.28,1)] hover:-translate-y-[9px] hover:border-accent/[.34]"
    :class="
      featured
        ? 'mb-[22px] grid grid-cols-[1.18fr_.82fr] max-[1100px]:grid-cols-1'
        : ''
    "
  >
    <!-- Gambar -->
    <div
      class="relative overflow-hidden bg-surface-2"
      :class="
        featured
          ? 'h-full min-h-[430px] max-[1100px]:aspect-[16/9.4] max-[1100px]:min-h-[320px]'
          : 'aspect-[16/10.4]'
      "
    >
      <img
        loading="lazy"
        :src="project.imageUrl"
        :alt="project.title"
        class="h-full w-full object-cover grayscale-[.42] contrast-[1.05] transition-[transform,filter] duration-[850ms] ease-[cubic-bezier(.22,.9,.28,1)] group-hover:scale-[1.07] group-hover:grayscale-0"
      />
      <div
        class="pointer-events-none absolute inset-0 opacity-85 transition-opacity duration-500 group-hover:opacity-100"
        style="
          background: linear-gradient(190deg, rgba(10, 11, 13, 0) 45%, rgba(10, 11, 13, 0.72));
        "
        aria-hidden="true"
      />
    </div>

    <!-- Konten -->
    <div
      :class="
        featured
          ? 'flex flex-col justify-center px-11 py-[46px] max-[1100px]:px-[30px] max-[1100px]:pb-[38px] max-[1100px]:pt-[34px]'
          : 'px-[25px] pb-[27px] pt-6'
      "
    >
      <!-- FEATURED -->
      <template v-if="featured">
        <span
          class="mb-[18px] inline-flex items-center gap-2 self-start rounded-full border border-accent/35 bg-accent/[.08] px-3 py-1.5 font-mono text-[0.67rem] uppercase tracking-[0.16em] text-accent"
        >
          ★ Featured case study
        </span>

        <h3 class="font-display text-[clamp(1.85rem,3.3vw,2.55rem)] font-bold leading-[1.05] tracking-[-0.022em]">
          {{ project.title }}
        </h3>

        <p class="mb-[17px] mt-2.5 max-w-[42ch] text-[1.02rem] text-muted">
          {{ project.description }}
        </p>

        <div class="mb-[19px] flex flex-wrap gap-[7px]">
          <span
            v-for="tag in project.tags"
            :key="tag.name"
            class="rounded-[7px] border border-line px-2.5 py-[5px] font-mono text-[0.68rem] uppercase tracking-[0.06em] text-muted-2"
          >
            {{ tag.name }}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3.5">
          <a
            :href="project.href || '#'"
            class="inline-flex items-center gap-[9px] font-mono text-[0.75rem] uppercase tracking-[0.12em] text-accent"
          >
            View case study
            <span
              class="inline-block transition-transform duration-[350ms] ease-[cubic-bezier(.22,.9,.28,1)] group-hover:translate-x-1.5"
              aria-hidden="true"
              >→</span
            >
          </a>
          <span
            class="rounded-full border border-line px-[11px] py-[5px] font-mono text-[0.68rem] tracking-[0.1em] text-muted"
            >{{ project.year }}</span
          >
        </div>
      </template>

      <!-- GRID -->
      <template v-else>
        <div class="mb-[11px] flex items-center justify-between gap-3.5">
          <h3 class="font-display text-[1.35rem] font-bold tracking-[-0.022em]">
            {{ project.title }}
          </h3>
          <span
            class="rounded-full border border-line px-[11px] py-[5px] font-mono text-[0.68rem] tracking-[0.1em] text-muted"
            >{{ project.year }}</span
          >
        </div>

        <p class="mb-[17px] text-[0.925rem] text-muted">
          {{ project.description }}
        </p>

        <div class="mb-[19px] flex flex-wrap gap-[7px]">
          <span
            v-for="tag in project.tags"
            :key="tag.name"
            class="rounded-[7px] border border-line px-2.5 py-[5px] font-mono text-[0.68rem] uppercase tracking-[0.06em] text-muted-2"
          >
            {{ tag.name }}
          </span>
        </div>

        <a
          :href="project.href || '#'"
          class="inline-flex items-center gap-[9px] font-mono text-[0.75rem] uppercase tracking-[0.12em] text-accent"
        >
          {{ project.category === "oss" ? "View on GitHub" : "Read more" }}
          <span
            class="inline-block transition-transform duration-[350ms] ease-[cubic-bezier(.22,.9,.28,1)] group-hover:translate-x-1.5"
            aria-hidden="true"
            >→</span
          >
        </a>
      </template>
    </div>
  </article>
</template>
