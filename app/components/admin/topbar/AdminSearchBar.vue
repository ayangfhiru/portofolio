<script setup lang="ts">
/**
 * Kotak pencarian topbar admin.
 *
 * Menyaring daftar modul dari konfigurasi navigasi tanpa panggilan
 * jaringan, sehingga hasilnya langsung muncul, tetap bekerja pada render
 * server, dan tidak menambah beban pada endpoint data.
 */
import { nextTick, ref, watch } from "vue";
import { CornerDownLeft, Search, X } from "@lucide/vue";
import type { AdminNavLink } from "~/types/admin";

interface Props {
  open?: boolean;
  modelValue?: string;
  results?: AdminNavLink[];
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  modelValue: "",
  results: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
  close: [];
  navigate: [];
}>();

const input = ref<HTMLInputElement | null>(null);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) nextTick(() => input.value?.focus());
  },
);

/** Nilai input dibaca lewat pengecekan tipe, bukan asersi. */
const handleInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  emit("update:modelValue", event.target.value);
};
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="-translate-y-1 opacity-0"
    leave-active-class="transition duration-100 ease-in"
    leave-to-class="translate-y-0 opacity-0"
  >
    <div
      v-if="props.open"
      id="topbar-search"
      class="border-t border-admin-line bg-admin-head/70"
    >
      <div class="mx-auto w-full max-w-[1280px] px-4 py-3 sm:px-6 lg:px-8">
        <div
          class="flex items-center gap-2.5 rounded-xl border border-admin-line bg-admin-card px-3.5 py-2.5"
        >
          <Search class="h-4 w-4 shrink-0 text-admin-muted-2" />
          <input
            ref="input"
            :value="props.modelValue"
            type="search"
            placeholder="Cari menu atau modul…"
            aria-label="Cari menu atau modul admin"
            class="min-w-0 flex-1 bg-transparent text-sm text-admin-ink outline-none placeholder:text-admin-muted-2 [&::-webkit-search-cancel-button]:appearance-none"
            @input="handleInput"
            @keydown.esc="emit('close')"
          />
          <button
            type="button"
            class="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-admin-bg-2 hover:text-admin-ink"
            aria-label="Tutup pencarian"
            @click="emit('close')"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <ul
          v-if="props.results.length"
          class="mt-2 max-h-[46vh] overflow-y-auto rounded-xl border border-admin-line bg-admin-card p-1.5"
        >
          <li v-for="result in props.results" :key="result.key">
            <NuxtLink
              :to="result.to"
              class="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-admin-bg-2"
              @click="emit('navigate')"
            >
              <component
                :is="result.icon"
                v-if="result.icon"
                class="mt-0.5 h-4 w-4 shrink-0 text-admin-muted"
              />
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-semibold text-admin-ink">{{ result.label }}</span>
                <span v-if="result.description" class="block text-xs text-admin-muted">
                  {{ result.description }}
                </span>
              </span>
              <CornerDownLeft class="mt-0.5 h-3.5 w-3.5 shrink-0 text-admin-muted-2" />
            </NuxtLink>
          </li>
        </ul>

        <p v-else class="mt-2 px-1 text-sm text-admin-muted">
          Tidak ada modul yang cocok dengan “{{ props.modelValue.trim() }}”.
        </p>
      </div>
    </div>
  </Transition>
</template>
