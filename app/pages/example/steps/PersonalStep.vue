<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { Step } from "~/type";
import {
  BaseDatePicker,
  BaseInput,
  BaseRadioGroup,
  BaseSelect,
  BaseTextarea,
} from "../form";

defineProps<{
  step: Step;
  form: {
    fullName: string;
    birthDate: string;
    gender: string;
    religion: string;
    email: string;
    phone: string;
    address: string;
  };
  errors: Record<string, string>;
  genderOptions: Array<{
    label: string;
    value: string;
  }>;
  religionOptions: Array<{
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
      <BaseInput
        v-model="form.fullName"
        title="Nama Lengkap"
        id="full-name"
        name="fullName"
        placeholder="Masukkan nama lengkap"
        :required="true"
        :error="errors.fullName"
        @clear-error="emit('clear-error', 'fullName')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseDatePicker
          v-model="form.birthDate"
          title="Tanggal Lahir"
          name="birthDate"
          placeholder="Pilih tanggal lahir"
          :error="errors.birthDate"
          :max="new Date().toISOString().slice(0, 10)"
          required
          @clear-error="emit('clear-error', 'birthDate')"
        />

        <BaseRadioGroup
          v-model="form.gender"
          title="Jenis Kelamin"
          id="gender"
          :options="genderOptions"
          :required="true"
          :error="errors.gender"
          @clear-error="emit('clear-error', 'gender')"
        />
      </div>

      <BaseSelect
        v-model="form.religion"
        title="Agama"
        id="religion"
        :options="religionOptions"
        :required="true"
        :error="errors.religion"
        @clear-error="emit('clear-error', 'religion')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.email"
          title="Alamat Email"
          id="email"
          name="email"
          placeholder="Masukkan email"
          type="email"
          :required="true"
          :error="errors.email"
          @clear-error="emit('clear-error', 'email')"
        />

        <BaseInput
          v-model="form.phone"
          title="Nomor HP / WA Siswa"
          id="wa"
          name="wa"
          placeholder="Masukkan nomor WA siswa"
          type="tel"
          :required="true"
          :error="errors.phone"
          @clear-error="emit('clear-error', 'phone')"
        />
      </div>

      <BaseTextarea
        v-model="form.address"
        title="Alamat Lengkap"
        id="address"
        placeholder="Masukkan alamat lengkap"
        :required="true"
        :error="errors.address"
        @clear-error="emit('clear-error', 'address')"
      />
    </div>
  </section>
</template>
