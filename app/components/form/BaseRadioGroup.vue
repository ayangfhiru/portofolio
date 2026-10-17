<script setup lang="ts">
interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}
interface Props {
  title: string;
  options: RadioOption[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
  name?: string;
}
const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
});
const emit = defineEmits<{ "clear-error": [] }>();
const model = defineModel<string>({ default: "" });
const handleChange = () => {
  if (props.error) {
    emit("clear-error");
  }
};
</script>
<template>
  <fieldset>
    <legend class="mb-3 block text-sm font-medium text-slate-700">
      {{ props.title }}
      <span v-if="props.required" class="ml-1 text-red-500" aria-hidden="true">
        *
      </span>
    </legend>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label
        v-for="option in props.options"
        :key="option.value"
        class="cursor-pointer rounded-xl border px-4 py-2.5 transition"
        :class="
          model === option.value
            ? 'border-[#D71920] bg-[#D71920]/5 ring-2 ring-[#D71920]/10'
            : 'border-slate-200 hover:border-slate-300'
        "
      >
        <input
          v-model="model"
          type="radio"
          :name="props.name"
          :value="option.value"
          :disabled="props.disabled || option.disabled"
          class="sr-only"
          @change="handleChange"
        />
        <span class="text-sm font-medium text-slate-800">
          {{ option.label }}
        </span>
      </label>
    </div>
    <p v-if="props.error" class="mt-1.5 text-sm text-red-500" role="alert">
      {{ props.error }}
    </p>
  </fieldset>
</template>
