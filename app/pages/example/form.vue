<script setup lang="ts"></script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <RegistrationHeader
      v-if="registrationContext"
      :batch="`${registrationContext.branchLabel} - ${registrationContext.academicYearLabel}`"
    />

    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <!-- Heading -->
      <div class="mb-6 sm:mb-8">
        <p class="mb-2 text-sm font-medium text-[#D71920]">
          Pendaftaran Siswa Baru
        </p>

        <h1
          class="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl"
        >
          Lengkapi data pendaftaran
        </h1>

        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          Isi informasi berikut secara bertahap. Data yang telah disimpan dapat
          diperiksa kembali sebelum pendaftaran dikirim.
        </p>
      </div>

      <div
        class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <RegistrationProgress
          :steps="steps"
          :current-step="currentStep"
          @go-to-step="goToStep"
        />

        <div class="px-4 py-6 sm:px-8 sm:py-8">
          <PersonalStep
            v-if="currentStep === 0"
            :step="steps[0]!"
            :form="form"
            :errors="errors"
            :gender-options="genderOptions"
            :religion-options="religionOptions"
            @clear-error="clearError"
          />

          <AcademicStep
            v-else-if="currentStep === 1"
            :step="steps[1]!"
            :form="form"
            :errors="errors"
            :education-level-options="educationLevelOptions"
            :curriculum-options="curriculumOptions"
            :school-regency-options="schoolRegencyOptions"
            :school-options="schoolOptions"
            :school-grade-options="schoolGradeOptions"
            @clear-error="clearError"
          />

          <ParentStep
            v-else-if="currentStep === 2"
            :step="steps[2]!"
            :form="form"
            :errors="errors"
            :occupation-options="occupationOptions"
            @clear-error="clearError"
          />

          <RegistrationStep
            v-else
            :step="steps[3]!"
            :form="form"
            :errors="errors"
            :information-source-options="informationSourceOptions"
            @select-program="showProgramModal = true"
            @clear-error="clearError"
          />

          <div class="mt-3">
            <RegistrationNavigation
              :is-first-step="isFirstStep"
              :is-last-step="isLastStep"
              @previous="previousStep"
              @next="nextStep"
              @submit="nextStep"
            />
          </div>

          <div
            class="mt-5 flex flex-col gap-2 text-center text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left"
          >
            <p>Data Anda akan digunakan untuk keperluan proses pendaftaran.</p>

            <p>Langkah {{ currentStep + 1 }} dari {{ steps.length }}</p>
          </div>
        </div>
      </div>
    </main>

    <ProgramSelectionModal
      :open="showProgramModal"
      :programs="programs"
      :categories="educationLevelOptions"
      @close="showProgramModal = false"
      @select="selectProgram"
    />
  </div>
</template>
