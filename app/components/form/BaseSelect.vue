<script setup lang="ts">
interface SelectOption {
  label: string;
  value: string | number;
}

interface Props {
  title: string;
  options: SelectOption[];
  required?: boolean;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  disabled?: boolean;
  maxVisibleOptions?: number;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  placeholder: "Pilih pilihan",
  searchPlaceholder: "Cari pilihan...",
  disabled: false,
  maxVisibleOptions: 5,
});

const emit = defineEmits<{
  "clear-error": [];
}>();

const model = defineModel<string | number>({ default: "" });

const isOpen = ref(false);
const search = ref("");

const inputId = computed(
  () => props.id ?? props.title.toLowerCase().replace(/\s+/g, "-"),
);

const errorId = computed(() => `${inputId.value}-error`);

const selectedOption = computed(() =>
  props.options.find((option) => option.value === model.value),
);

const filteredOptions = computed(() => {
  const keyword = search.value.toLowerCase().trim();

  if (!keyword) {
    return props.options;
  }

  return props.options.filter((option) =>
    option.label.toLowerCase().includes(keyword),
  );
});

const optionHeight = 40;

const dropdownMaxHeight = computed(() => {
  return `${props.maxVisibleOptions * optionHeight}px`;
});

const selectOption = (option: SelectOption) => {
  model.value = option.value;
  search.value = "";
  isOpen.value = false;

  if (props.error) {
    emit("clear-error");
  }
};

const openSelect = () => {
  if (props.disabled) {
    return;
  }

  isOpen.value = true;
};

const closeSelect = () => {
  isOpen.value = false;
  search.value = "";
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (!target.closest(`#${inputId.value}`)) {
    closeSelect();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div class="relative" :id="inputId">
    <label
      :for="`${inputId}-button`"
      class="mb-2 block text-sm font-medium text-slate-700"
    >
      {{ props.title }}

      <span v-if="props.required" class="ml-1 text-red-500" aria-hidden="true">
        *
      </span>
    </label>

    <!-- Trigger -->
    <button
      :id="`${inputId}-button`"
      type="button"
      :disabled="props.disabled"
      class="flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      :class="
        props.error
          ? 'border-red-500 focus:ring-4 focus:ring-red-500/10'
          : 'border-slate-200 hover:border-slate-300 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10'
      "
      @click.stop="openSelect"
    >
      <span :class="selectedOption ? 'text-slate-900' : 'text-slate-400'">
        {{ selectedOption?.label ?? props.placeholder }}
      </span>

      <svg
        class="h-4 w-4 text-slate-400 transition"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m19 9-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <!-- Search -->
      <div class="border-b border-slate-100 p-2">
        <input
          v-model="search"
          type="text"
          :placeholder="props.searchPlaceholder"
          class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10"
          @click.stop
        />
      </div>

      <!-- Options -->
      <div
        class="overflow-y-auto p-1"
        :style="{ maxHeight: dropdownMaxHeight }"
      >
        <button
          v-for="option in filteredOptions"
          :key="option.value"
          type="button"
          class="w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-50"
          :class="
            model === option.value
              ? 'bg-[#D71920]/5 font-medium text-[#D71920]'
              : 'text-slate-700'
          "
          @click="selectOption(option)"
        >
          {{ option.label }}
        </button>

        <div
          v-if="filteredOptions.length === 0"
          class="px-3 py-4 text-center text-sm text-slate-400"
        >
          Data tidak ditemukan
        </div>
      </div>
    </div>

    <!-- Error -->
    <p
      v-if="props.error"
      :id="errorId"
      class="mt-1.5 text-sm text-red-500"
      role="alert"
    >
      {{ props.error }}
    </p>
  </div>
</template>
