<script setup lang="ts">
import { CalendarDays, ChevronLeft, ChevronRight } from "@lucide/vue";
import { computed, ref, watch } from "vue";

interface Props {
  title: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  min?: string;
  max?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Pilih tanggal",
  required: false,
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  "clear-error": [];
}>();

const model = defineModel<string>({ default: "" });

const inputId = computed(
  () =>
    props.id ?? props.name ?? props.title.toLowerCase().replace(/\s+/g, "-"),
);

const errorId = computed(() => `${inputId.value}-error`);

const isOpen = ref(false);
const showMonthYearPicker = ref(false);

const today = new Date();

const viewMonth = ref(
  model.value ? Number(model.value.split("-")[1]) - 1 : today.getMonth(),
);

const viewYear = ref(
  model.value ? Number(model.value.split("-")[0]) : today.getFullYear(),
);

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const years = computed(() => {
  const currentYear = today.getFullYear();
  const selectedYear = model.value
    ? Number(model.value.slice(0, 4))
    : currentYear;

  const start = Math.min(currentYear - 100, selectedYear - 5);
  const end = Math.max(currentYear + 20, selectedYear + 5);

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const selectedDate = computed(() => {
  if (!model.value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(model.value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
});

const displayValue = computed(() =>
  selectedDate.value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(selectedDate.value)
    : "",
);

function formatISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function isDisabled(date: Date) {
  const value = formatISO(date);

  return (
    (props.min !== undefined && value < props.min) ||
    (props.max !== undefined && value > props.max)
  );
}

const calendarDays = computed(() => {
  const firstDay = new Date(viewYear.value, viewMonth.value, 1);

  // Kalender dimulai hari Senin
  const offset = (firstDay.getDay() + 6) % 7;

  const start = new Date(viewYear.value, viewMonth.value, 1 - offset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );

    return {
      date,
      key: formatISO(date),
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === viewMonth.value,
      isToday: formatISO(date) === formatISO(today),
      isSelected: formatISO(date) === model.value,
      disabled: isDisabled(date),
    };
  });
});

function changeMonth(amount: number) {
  const date = new Date(viewYear.value, viewMonth.value + amount, 1);

  viewMonth.value = date.getMonth();
  viewYear.value = date.getFullYear();
}

function openPicker() {
  if (props.disabled || props.readonly) return;

  if (selectedDate.value) {
    viewMonth.value = selectedDate.value.getMonth();
    viewYear.value = selectedDate.value.getFullYear();
  } else {
    viewMonth.value = today.getMonth();
    viewYear.value = today.getFullYear();
  }

  isOpen.value = !isOpen.value;
  showMonthYearPicker.value = false;
}

function selectDate(date: Date) {
  model.value = formatISO(date);
  isOpen.value = false;
  showMonthYearPicker.value = false;

  if (props.error) {
    emit("clear-error");
  }
}

watch([viewMonth, viewYear], () => {
  showMonthYearPicker.value = false;
});
</script>

<template>
  <div class="w-full">
    <label :for="inputId" class="mb-2 block text-sm font-medium text-slate-700">
      {{ title }}
      <span v-if="required" class="ml-1 text-red-500" aria-hidden="true">
        *
      </span>
    </label>

    <div class="relative">
      <!-- Input tanggal -->
      <button
        :id="inputId"
        type="button"
        :disabled="disabled"
        :aria-expanded="isOpen"
        :aria-invalid="!!error"
        :aria-describedby="error ? errorId : undefined"
        class="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        :class="
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
            : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10'
        "
        @click="openPicker"
      >
        <span :class="displayValue ? 'text-slate-900' : 'text-slate-400'">
          {{ displayValue || placeholder }}
        </span>

        <CalendarDays class="h-5 w-5 shrink-0 text-slate-400" />
      </button>

      <!-- Popup kalender -->
      <div
        v-if="isOpen"
        class="absolute left-0 top-full z-50 mt-2 w-full min-w-72.5 max-w-85 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10"
      >
        <!-- Header kalender -->
        <div class="mb-4 flex items-center justify-between gap-2">
          <button
            type="button"
            class="flex min-w-0 items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            :aria-expanded="showMonthYearPicker"
            @click="showMonthYearPicker = !showMonthYearPicker"
          >
            <span>{{ months[viewMonth] }} {{ viewYear }}</span>
            <ChevronRight
              class="h-4 w-4 text-slate-400 transition-transform"
              :class="{ 'rotate-90': showMonthYearPicker }"
            />
          </button>

          <div class="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Bulan sebelumnya"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              @click="changeMonth(-1)"
            >
              <ChevronLeft class="h-4 w-4" />
            </button>

            <button
              type="button"
              aria-label="Bulan berikutnya"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              @click="changeMonth(1)"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Pemilihan bulan dan tahun -->
        <div v-if="showMonthYearPicker" class="mb-4 grid grid-cols-2 gap-2">
          <select
            v-model.number="viewMonth"
            aria-label="Pilih bulan"
            class="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option
              v-for="(month, index) in months"
              :key="month"
              :value="index"
            >
              {{ month }}
            </option>
          </select>

          <select
            v-model.number="viewYear"
            aria-label="Pilih tahun"
            class="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>

        <!-- Nama hari -->
        <div class="mb-2 grid grid-cols-7">
          <span
            v-for="day in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']"
            :key="day"
            class="py-2 text-center text-xs font-medium text-slate-400"
          >
            {{ day }}
          </span>
        </div>

        <!-- Grid tanggal -->
        <div class="grid grid-cols-7 gap-y-1">
          <button
            v-for="item in calendarDays"
            :key="item.key"
            type="button"
            :disabled="item.disabled"
            :aria-label="
              new Intl.DateTimeFormat('id-ID', {
                dateStyle: 'full',
              }).format(item.date)
            "
            :aria-pressed="item.isSelected"
            class="relative mx-auto flex h-9 w-9 items-center justify-center rounded-xl text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-25"
            :class="[
              item.isSelected
                ? 'bg-blue-600 font-semibold text-white shadow-sm'
                : item.inCurrentMonth
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-slate-300 hover:bg-slate-50',
              item.isToday && !item.isSelected
                ? 'font-semibold ring-1 ring-inset ring-slate-300'
                : '',
            ]"
            @click="selectDate(item.date)"
          >
            {{ item.day }}
          </button>
        </div>

        <!-- Footer -->
        <div
          class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"
        >
          <button
            type="button"
            class="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            @click="
              model = '';
              isOpen = false;
            "
          >
            Hapus
          </button>

          <button
            type="button"
            class="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            @click="selectDate(today)"
          >
            Hari ini
          </button>
        </div>
      </div>
    </div>

    <p
      v-if="error"
      :id="errorId"
      class="mt-1.5 text-sm text-red-500"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
