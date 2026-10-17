<script setup lang="ts">
interface Props {
  title: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "numeric"
    | "date"
    | "file";
  id?: string;
  name?: string;
  autocomplete?: string;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  required: false,
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{ "clear-error": [] }>();
const model = defineModel<string | File | null>({ default: "" });
const inputId = computed(
  () =>
    props.id ?? props.name ?? props.title.toLowerCase().replace(/\s+/g, "-"),
);
const errorId = computed(() => `${inputId.value}-error`);
const handleInput = () => {
  if (props.error) {
    emit("clear-error");
  }
};
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  model.value = input.files?.[0] ?? null;
  handleInput();
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
    <input
      :id="inputId"
      v-model="model"
      :name="props.name"
      :type="props.type"
      :value="props.type === 'file' ? undefined : model"
      :placeholder="props.placeholder"
      :autocomplete="props.autocomplete"
      :disabled="props.disabled"
      :readonly="props.readonly"
      :maxlength="props.maxlength"
      :required="props.required"
      :aria-invalid="!!props.error"
      :aria-describedby="props.error ? errorId : undefined"
      class="w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 read-only:bg-slate-50"
      :class="
        props.error
          ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
          : 'border-slate-200 hover:border-slate-300 focus:border-[#D71920] focus:ring-4 focus:ring-[#D71920]/10'
      "
      @input="props.type !== 'file' && handleInput()"
      @change="props.type === 'file' && handleFileChange($event)"
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
