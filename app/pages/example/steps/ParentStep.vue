<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { Step } from "~/type";
import { BaseInput, BaseSelect, BaseTextarea } from "../form";

defineProps<{
  step: Step;
  form: {
    fatherName: string;
    motherName: string;
    parentAddress: string;
    fatherOccupation: string;
    motherOccupation: string;
    parentPhone: string;
  };
  errors: Record<string, string>;
  occupationOptions: Array<{
    label: string;
    value: string;
  }>;
}>();

const emit = defineEmits<{
  "clear-error": [field: string];
}>();
</script>

<template>
  <section>
    <div class="mb-7">
      <div class="flex items-start gap-3">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600"
        >
          <component :is="step.icon" class="h-5 w-5" aria-hidden="true" />
        </div>

        <!-- Judul dan deskripsi -->
        <div class="min-w-0 flex-1 pt-0.5">
          <h2
            class="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
          >
            {{ step.title }}
          </h2>

          <p class="mt-1 text-sm leading-6 text-slate-500">
            {{ step.longDescription }}
          </p>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.fatherName"
          title="Nama Ayah"
          id="father-name"
          placeholder="Masukkan nama ayah"
          :error="errors.fatherName"
          @clear-error="emit('clear-error', 'fatherName')"
        />

        <BaseInput
          v-model="form.motherName"
          title="Nama Ibu"
          id="mother-name"
          placeholder="Masukkan nama ibu"
          :error="errors.motherName"
          @clear-error="emit('clear-error', 'motherName')"
        />
      </div>

      <BaseTextarea
        v-model="form.parentAddress"
        title="Alamat Orangtua / Wali"
        id="parent-address"
        placeholder="Masukkan alamat lengkap orangtua atau wali"
        :required="true"
        :error="errors.parentAddress"
        @clear-error="emit('clear-error', 'parentAddress')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseSelect
          v-model="form.fatherOccupation"
          title="Pekerjaan Ayah"
          id="father-occupation"
          :options="occupationOptions"
          :error="errors.fatherOccupation"
          :max-visible-options="4"
          @clear-error="emit('clear-error', 'fatherOccupation')"
        />

        <BaseSelect
          v-model="form.motherOccupation"
          title="Pekerjaan Ibu"
          id="mother-occupation"
          :options="occupationOptions"
          :error="errors.motherOccupation"
          :max-visible-options="4"
          @clear-error="emit('clear-error', 'motherOccupation')"
        />
      </div>

      <BaseInput
        v-model="form.parentPhone"
        title="Nomor HP / WA Orangtua"
        id="parent-phone"
        placeholder="08xxxxxxxxxx"
        type="tel"
        :required="true"
        :error="errors.parentPhone"
        @clear-error="emit('clear-error', 'parentPhone')"
      />
    </div>
  </section>
</template>
