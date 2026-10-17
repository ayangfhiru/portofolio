<script setup lang="ts">
interface Props {
  title: string;
  required?: boolean;
  id?: string;
  placeholder?: string;
  rows?: number;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  placeholder: "Masukkan alamat lengkap",
  rows: 4,
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{ "clear-error": [] }>();
const model = defineModel<string>({ default: "" });
const inputId = computed(
  () => props.id ?? props.title.toLowerCase().replace(/\s+/g, "-"),
);
const errorId = computed(() => `${inputId.value}-error`);
const handleInput = () => {
  if (props.error) {
    emit("clear-error");
  }
};
</script>

<template>
  <div>
    <label :for="inputId" class="mb-2 block text-sm font-medium text-slate-700">
      {{ props.title }}
      <span v-if="props.required" class="ml-1 text-red-500" aria-hidden="true">
        *
      </span>
    </label>
    <textarea
      :id="inputId"
      v-model="model"
      :rows="props.rows"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :maxlength="props.maxlength"
      :required="props.required"
      :aria-invalid="!!props.error"
      :aria-describedby="props.error ? errorId : undefined"
      class="w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 read-only:bg-slate-50"
      :class="
        props.error
          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
          : 'border-slate-200 hover:border-slate-300 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10'
      "
      @input="handleInput"
    />
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
