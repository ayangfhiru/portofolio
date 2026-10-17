<script setup lang="ts">
import { computed } from "vue";

interface Props {
  title: string;
  description?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
});

const emit = defineEmits<{
  "clear-error": [];
}>();

const model = defineModel<boolean>({ default: false });

const inputId = computed(
  () => props.id ?? props.title.toLowerCase().replace(/\s+/g, "-"),
);

const errorId = computed(() => `${inputId.value}-error`);

const handleChange = () => {
  if (props.error) {
    emit("clear-error");
  }
};
</script>

<template>
  <div>
    <label
      :for="inputId"
      class="group flex gap-3.5 rounded-xl border p-4 transition-all duration-200 sm:p-5"
      :class="[
        props.disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-60'
          : 'cursor-pointer',
        model && !props.error
          ? 'border-red-200 bg-red-50/50 ring-1 ring-red-100'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70',
        props.error && 'border-red-300 bg-red-50/40 ring-1 ring-red-100',
      ]"
    >
      <!-- Custom checkbox -->
      <span
        class="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
      >
        <input
          :id="inputId"
          v-model="model"
          type="checkbox"
          :disabled="props.disabled"
          :required="props.required"
          :aria-invalid="!!props.error"
          :aria-describedby="props.error ? errorId : undefined"
          class="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          @change="handleChange"
        />

        <span
          class="pointer-events-none flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 peer-focus-visible:ring-4 peer-focus-visible:ring-red-100"
          :class="
            model
              ? 'border-red-600 bg-red-600'
              : 'border-slate-300 bg-white group-hover:border-slate-400'
          "
        >
          <svg
            v-if="model"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            class="h-3.5 w-3.5 text-white"
            aria-hidden="true"
          >
            <path
              d="m5 10 3.2 3.2L15 6.5"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </span>

      <!-- Text content -->
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-semibold text-slate-800">
            {{ props.title }}
          </span>

          <span
            v-if="props.required"
            class="ml-1 text-red-500"
            aria-hidden="true"
          >
            *
          </span>
        </span>

        <span
          v-if="props.description"
          class="mt-2 block text-xs leading-6 text-slate-600 sm:text-sm sm:leading-6"
        >
          {{ props.description }}
        </span>
      </span>
    </label>

    <!-- Validation error -->
    <p
      v-if="props.error"
      :id="errorId"
      class="mt-2 flex items-start gap-1.5 text-sm text-red-600"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 6a1 1 0 0 1 2 0v4a1 1 0 1 1-2 0V6Zm1 8a1.25 1.25 0 1 0 0-2.5A1.25 1.25 0 0 0 10 14Z"
          clip-rule="evenodd"
        />
      </svg>

      <span>{{ props.error }}</span>
    </p>
  </div>
</template>
