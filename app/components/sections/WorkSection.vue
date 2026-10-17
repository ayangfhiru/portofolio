<script setup lang="ts">
/**
 * Bagian Work: filter kategori + featured project + grid project.
 * Data diambil dari `/api/projects` (SSR lewat useFetch).
 */
import { computed, ref } from "vue";
import ProjectCard from "~/components/ui/ProjectCard.vue";
import SectionHeading from "~/components/ui/SectionHeading.vue";
import type { ApiResponse } from "~/types/api";
import type { ProjectCategory, ProjectItem } from "~/types/project";
import { PROJECT_FILTERS } from "~/utils/navigation";

const activeFilter = ref<ProjectCategory | "all">("all");

const { data: projectResponse, status } = await useFetch<ApiResponse<ProjectItem[]>>(
  "/api/projects",
);

const projects = computed<ProjectItem[]>(() => projectResponse.value?.data ?? []);

/**
 * API mengembalikan `success: false` bila database tidak terjangkau
 * (data fallback tetap ditampilkan). Tampilkan pemberitahuan halus
 * agar developer tahu sumber datanya.
 */
const usingFallback = computed(
  () => projectResponse.value?.success === false,
);
const errorMessage = computed<string | null>(
  () => projectResponse.value?.error ?? null,
);

const filteredProjects = computed<ProjectItem[]>(() =>
  activeFilter.value === "all"
    ? projects.value
    : projects.value.filter((project) => project.category === activeFilter.value),
);

/** Kartu pertama tampil sebagai featured hanya pada filter "all". */
const featuredProject = computed<ProjectItem | null>(() => {
  if (activeFilter.value !== "all") return null;
  return filteredProjects.value.find((project) => project.featured) ?? null;
});

const gridProjects = computed<ProjectItem[]>(() =>
  filteredProjects.value.filter((project) => project !== featuredProject.value),
);
</script>

<template>
  <section id="work" class="py-[110px]">
    <div class="mx-auto w-[min(1240px,100%-48px)] max-[680px]:w-[min(1240px,100%-32px)]">
      <SectionHeading eyebrow="Selected work">
        <template #title>
          Projects I've<br /><em class="not-italic text-accent">shipped &amp; scaled.</em>
        </template>

        <template #actions>
          <div v-reveal class="flex flex-wrap gap-[9px]">
            <button
              v-for="filter in PROJECT_FILTERS"
              :key="filter.value"
              class="rounded-full border px-[17px] py-[9px] font-mono text-[0.73rem] uppercase tracking-[0.07em] transition-all duration-[320ms] ease-[cubic-bezier(.22,.9,.28,1)]"
              :class="
                activeFilter === filter.value
                  ? 'border-accent bg-accent font-bold text-accent-ink'
                  : 'border-line text-muted hover:border-line-strong hover:text-ink'
              "
              :aria-pressed="activeFilter === filter.value"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </template>
      </SectionHeading>

      <!-- Loading -->
      <div
        v-if="status === 'pending'"
        class="py-12 text-center text-muted"
        role="status"
      >
        Loading projects…
      </div>

      <!-- Empty -->
      <div
        v-else-if="filteredProjects.length === 0"
        class="rounded-[26px] border border-dashed border-line py-16 text-center text-muted"
      >
        No projects in this category yet.
      </div>

      <!-- Konten -->
      <template v-else>
        <!-- Peringatan bila data berasal dari fallback -->
        <p
          v-if="usingFallback"
          role="status"
          class="mb-5 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 font-mono text-[0.74rem] text-accent"
        >
          {{ errorMessage }}
        </p>

        <ProjectCard
          v-if="featuredProject"
          :project="featuredProject"
          featured
          v-reveal
        />

        <div class="grid grid-cols-2 gap-[22px] max-[680px]:grid-cols-1">
          <ProjectCard
            v-for="(project, index) in gridProjects"
            :key="project.id ?? project.slug"
            :project="project"
            v-reveal="index * 0.06"
          />
        </div>
      </template>
    </div>
  </section>
</template>
