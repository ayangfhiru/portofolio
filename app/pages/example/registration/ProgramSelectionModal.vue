<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from "vue";
import type { Program } from "~/type";
import { formatPrice } from "~/utils/index";
import type { MasterOption } from "~/utils/master-data";

const props = withDefaults(
  defineProps<{
    open: boolean;
    programs: Program[];
    categories: MasterOption[];
    columns?: number;
  }>(),
  {
    columns: 3,
  },
);

const emit = defineEmits<{ close: []; select: [program: Program] }>();

const search = ref("");
const activeCategory = ref("Semua");
const expandedPrograms = ref<string[]>([]);

const selectedCategory = computed(() => activeCategory.value.trim());

const filteredPrograms = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  const categoryValue = selectedCategory.value;

  return props.programs.filter((program) => {
    const searchableText = [
      program.title,
      program.subtitle,
      ...program.benefits,
    ]
      .join(" ")
      .toLowerCase();

    const programEducationLevelId = String(
      program.educationLevelId ?? "",
    ).trim();

    const matchesSearch =
      keyword === "" || searchableText.includes(keyword);
    const matchesCategory =
      categoryValue === "Semua" ||
      (categoryValue !== "" && programEducationLevelId === categoryValue);

    return matchesSearch && matchesCategory;
  });
});

const gridStyle = computed(() => ({
  "--program-columns": Math.min(Math.max(props.columns, 1), 6),
}));

const isExpanded = (program: Program) =>
  expandedPrograms.value.includes(program.id);

const toggleBenefits = (program: Program) => {
  expandedPrograms.value = isExpanded(program)
    ? expandedPrograms.value.filter((id) => id !== program.id)
    : [...expandedPrograms.value, program.id];
};

const selectProgram = (program: Program) => {
  emit("select", program);
};
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="props.open"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          @click="emit('close')"
        />

        <div
          class="relative flex h-full w-full flex-col bg-white sm:m-4 sm:h-[90vh] sm:max-w-7xl sm:rounded-2xl sm:shadow-2xl"
        >
          <!-- Header -->
          <div
            class="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"
          >
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                Pilih Program
              </h2>
              <p class="mt-0.5 text-sm text-slate-500">
                Pilih program bimbingan yang sesuai dengan kebutuhan Anda.
              </p>
            </div>
            <button
              type="button"
              aria-label="Tutup modal"
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              @click="emit('close')"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Search and filters -->
          <div class="shrink-0 border-b border-slate-200 px-5 py-4 sm:px-6">
            <label class="relative block">
              <span class="sr-only">Cari program</span>
              <svg
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                />
              </svg>
              <input
                v-model="search"
                type="search"
                placeholder="Cari program, jenjang, atau periode..."
                class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#D71920] focus:bg-white focus:ring-4 focus:ring-[#D71920]/10"
              />
            </label>

            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
                :class="
                  activeCategory === 'Semua'
                    ? 'border-[#D71920] bg-[#D71920] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D71920] hover:text-[#D71920]'
                "
                @click="activeCategory = 'Semua'"
              >
                Semua
              </button>

              <button
                v-for="category in props.categories"
                :key="category.value"
                type="button"
                class="rounded-full border px-4 py-1.5 text-sm font-medium transition"
                :class="
                  activeCategory === category.value
                    ? 'border-[#D71920] bg-[#D71920] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#D71920] hover:text-[#D71920]'
                "
                @click="activeCategory = category.value"
              >
                {{ category.label }}
              </button>
              <span class="ml-1 text-sm text-slate-400">
                {{ filteredPrograms.length }} program
              </span>
            </div>
          </div>

          <!-- Cards -->
          <div class="min-h-0 flex-1 overflow-y-auto">
            <div class="program-grid gap-4 p-5 sm:p-6" :style="gridStyle">
              <article
                v-for="program in filteredPrograms"
                :key="`${program.id}-${program.programId ?? ''}-${program.educationLevelId ?? ''}`"
                class="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md"
              >
                <div class="aspect-16/7 overflow-hidden bg-slate-100">
                  <img
                    :src="program.image"
                    :alt="program.title"
                    class="h-full w-full object-cover"
                  />
                </div>

                <div class="flex flex-1 flex-col p-4 sm:p-5">
                  <p
                    class="text-xs font-semibold uppercase tracking-wide text-[#D71920]"
                  >
                    {{ program.subtitle }}
                  </p>
                  <h3
                    class="mt-2 text-base font-semibold leading-6 text-slate-900"
                  >
                    {{ program.title }}
                  </h3>

                  <ul class="mt-4 space-y-2 text-sm leading-5 text-slate-600">
                    <li
                      v-for="benefit in isExpanded(program)
                        ? program.benefits
                        : program.benefits.slice(0, 3)"
                      :key="benefit"
                      class="flex gap-2"
                    >
                      <svg
                        class="mt-0.5 h-4 w-4 shrink-0 text-[#D71920]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m5 12 4 4L19 6"
                        />
                      </svg>
                      <span>{{ benefit }}</span>
                    </li>
                  </ul>

                  <button
                    v-if="program.benefits.length > 3"
                    type="button"
                    class="mt-3 self-start text-sm font-semibold text-[#D71920] hover:text-[#b9151b]"
                    @click="toggleBenefits(program)"
                  >
                    {{
                      isExpanded(program)
                        ? "Sembunyikan"
                        : "Informasi selengkapnya"
                    }}
                    <span aria-hidden="true">{{
                      isExpanded(program) ? "▲" : "▼"
                    }}</span>
                  </button>

                  <!-- Price and action stay side by side -->
                  <div
                    class="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4"
                  >
                    <div class="min-w-0">
                      <p
                        class="text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Biaya program
                      </p>
                      <p
                        class="mt-0.5 truncate text-lg font-bold text-slate-900"
                      >
                        {{ formatPrice(program.price) }}
                      </p>
                      <p class="text-[11px] text-slate-400">
                        + {{ formatPrice(program.registrationFee) }} pendaftaran
                      </p>
                    </div>
                    <button
                      type="button"
                      class="shrink-0 rounded-xl bg-[#D71920] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#b9151b] focus:outline-none focus:ring-4 focus:ring-[#D71920]/20"
                      @click="selectProgram(program)"
                    >
                      Pilih →
                    </button>
                  </div>
                </div>
              </article>

              <div
                v-if="filteredPrograms.length === 0"
                class="col-span-full rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center text-sm text-slate-500"
              >
                Program tidak ditemukan. Coba gunakan kata kunci atau jenjang
                lain.
              </div>
            </div>
          </div>

          <div
            class="shrink-0 border-t border-slate-100 bg-white px-5 py-4 sm:px-6"
          >
            <button
              type="button"
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="emit('close')"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.program-grid {
  display: grid;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .program-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .program-grid {
    grid-template-columns: repeat(var(--program-columns), minmax(0, 1fr));
  }
}
</style>
