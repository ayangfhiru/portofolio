<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { Step } from "~/type";
import { BaseInput, BaseSelect } from "../form";

defineProps<{
  step: Step;
  form: {
    educationLevel: string;
    curriculum: string;
    schoolRegency: string;
    school: string;
    otherSchool: string;
    schoolGrade: string;
    classAtSchool: string;
  };
  errors: Record<string, string>;
  educationLevelOptions: Array<{
    label: string;
    value: string;
  }>;
  curriculumOptions: Array<{
    label: string;
    value: string;
  }>;
  schoolRegencyOptions: Array<{
    label: string;
    value: string;
  }>;
  schoolOptions: Array<{
    label: string;
    value: string;
  }>;
  schoolGradeOptions: Array<{
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
      <BaseSelect
        v-model="form.educationLevel"
        title="Jenjang"
        id="education-level"
        :options="educationLevelOptions"
        :required="true"
        :error="errors.educationLevel"
        @clear-error="emit('clear-error', 'educationLevel')"
      />

      <BaseSelect
        v-model="form.curriculum"
        title="Kurikulum"
        id="curriculum"
        :options="curriculumOptions"
        :error="errors.curriculum"
        @clear-error="emit('clear-error', 'curriculum')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseSelect
          v-model="form.schoolRegency"
          title="Kabupaten"
          id="school-regency"
          :options="schoolRegencyOptions"
          :required="true"
          :max-visible-options="4"
          :error="errors.schoolRegency"
          @clear-error="emit('clear-error', 'schoolRegency')"
        />

        <BaseSelect
          v-model="form.school"
          title="Sekolah"
          id="school"
          :options="schoolOptions"
          :required="true"
          :max-visible-options="4"
          :error="errors.school"
          @clear-error="emit('clear-error', 'school')"
        />
      </div>

      <BaseInput
        v-if="form.school == `0`"
        v-model="form.otherSchool"
        title="Sekolah Lainnya"
        id="other-school"
        placeholder="Sekolah Lainnya"
        :required="true"
        :error="errors.otherSchool"
        @clear-error="emit('clear-error', 'otherSchool')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseSelect
          v-model="form.schoolGrade"
          title="Kelas"
          id="school-grade"
          :options="schoolGradeOptions"
          :required="true"
          :error="errors.schoolGrade"
          :max-visible-options="2"
          @clear-error="emit('clear-error', 'schoolGrade')"
        />

        <BaseInput
          v-model="form.classAtSchool"
          title="Kelas Di Sekolah"
          id="class-at-school"
          placeholder="Contoh: X IPA 1"
          :error="errors.classAtSchool"
          @clear-error="emit('clear-error', 'classAtSchool')"
        />
      </div>
    </div>
  </section>
</template>
