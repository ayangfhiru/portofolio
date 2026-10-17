<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { Step } from "~/type";
import { BaseCheckbox, BaseInput, BaseSelect, BaseTextarea } from "../form";

defineProps<{
  step: Step;
  form: {
    officeUnit: string;
    informationSource: string;
    programId: string | null;
    program: string;
    programFee: string;
    registrationFee: string;
    registrationDate: string;
    period: string;
    studentStatus: string;
    photo: File | null;
    registrationReason: string;
    notes: string;
    confirmData: boolean;
  };
  errors: Record<string, string>;
  informationSourceOptions: Array<{
    label: string;
    value: string;
  }>;
}>();

const emit = defineEmits<{
  "clear-error": [field: string];
  "select-program": [];
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
          v-model="form.officeUnit"
          title="Unit Kantor"
          id="office-unit"
          :required="true"
          readonly
          :error="errors.officeUnit"
          @clear-error="emit('clear-error', 'officeUnit')"
        />

        <BaseSelect
          v-model="form.informationSource"
          title="Info Via"
          id="information-source"
          :options="informationSourceOptions"
          :error="errors.informationSource"
          @clear-error="emit('clear-error', 'informationSource')"
        />
      </div>

      <BaseInput
        v-model="form.program"
        title="Pilih Program"
        id="program"
        placeholder="Pilih program pendaftaran"
        :required="true"
        :error="errors.program"
        readonly
        @click="emit('select-program')"
        @clear-error="emit('clear-error', 'program')"
      />

      <div class="grid gap-5 sm:grid-cols-2">
        <BaseInput
          v-model="form.programFee"
          title="Biaya Program"
          id="program-fee"
          :required="true"
          readonly
        />

        <BaseInput
          v-model="form.registrationFee"
          title="Biaya Pendaftaran"
          id="registration-fee"
          :required="true"
          readonly
        />

        <BaseInput
          v-model="form.registrationDate"
          title="Tanggal Daftar"
          id="registration-date"
          :required="true"
          readonly
        />

        <BaseInput
          v-model="form.period"
          title="Periode"
          id="period"
          :required="true"
          readonly
        />

        <BaseInput
          v-model="form.studentStatus"
          title="Status Siswa"
          id="student-status"
          readonly
        />

        <BaseInput
          v-model="form.photo"
          title="Foto"
          id="photo"
          type="file"
          :error="errors.photo"
          @clear-error="emit('clear-error', 'photo')"
        />
      </div>

      <BaseTextarea
        v-model="form.registrationReason"
        title="Alasan Daftar Neutron"
        id="registration-reason"
        placeholder="Ceritakan alasan mendaftar di Neutron"
        :rows="4"
        :error="errors.registrationReason"
        @clear-error="emit('clear-error', 'registrationReason')"
      />

      <BaseTextarea
        v-model="form.notes"
        title="Keterangan"
        id="notes"
        placeholder="Tambahkan keterangan jika diperlukan"
        :rows="4"
        :error="errors.notes"
        @clear-error="emit('clear-error', 'notes')"
      />

      <BaseCheckbox
        v-model="form.confirmData"
        id="confirm-data"
        title="Pernyataan"
        description="Saya menyatakan bahwa data yang diisi dalam formulir ini benar dan sesuai dengan keadaan sebenarnya."
        :required="true"
        :error="errors.confirmData"
        @clear-error="emit('clear-error', 'confirmData')"
      />
    </div>
  </section>
</template>
