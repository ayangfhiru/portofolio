<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import type { Step } from "../../type";

interface Props {
  steps: Step[];
  currentStep: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "go-to-step": [step: number];
}>();

const currentStepData = computed(() => {
  return (
    props.steps[props.currentStep] ?? {
      key: "",
      title: "",
      description: "",
    }
  );
});
</script>

<template>
  <div class="border-b border-slate-200 px-4 py-5 sm:px-8 sm:py-6">
    <!-- Desktop Stepper -->
    <div class="hidden sm:block">
      <div class="flex items-start">
        <template v-for="(step, index) in steps" :key="step.key">
          <!-- Step Item -->
          <button
            type="button"
            class="group flex min-w-0 flex-1 flex-col items-center text-center"
            :disabled="index > currentStep"
            :aria-current="index === currentStep ? 'step' : undefined"
            @click="emit('go-to-step', index)"
          >
            <!-- Step Circle -->
            <div
              class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200"
              :class="[
                index < currentStep
                  ? 'border-[#D71920] bg-[#D71920] text-white'
                  : index === currentStep
                    ? 'border-[#D71920] bg-white text-[#D71920] ring-4 ring-[#D71920]/10'
                    : 'border-slate-200 bg-white text-slate-400',
              ]"
            >
              <!-- Completed -->
              <svg
                v-if="index < currentStep"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415.005l-3.25-3.25a1 1 0 111.415-1.42l2.542 2.54 6.543-6.545a1 1 0 011.415 0z"
                  clip-rule="evenodd"
                />
              </svg>

              <!-- Current / Upcoming -->
              <span v-else>
                {{ index + 1 }}
              </span>
            </div>

            <!-- Step Text -->
            <div class="mt-3 w-full px-1">
              <p
                class="text-sm font-semibold leading-5 transition-colors"
                :class="[
                  index === currentStep
                    ? 'text-[#D71920]'
                    : index < currentStep
                      ? 'text-slate-800'
                      : 'text-slate-400',
                ]"
              >
                {{ step.title }}
              </p>

              <p class="mt-1 text-xs leading-5 text-slate-500">
                {{ step.description }}
              </p>
            </div>
          </button>

          <!-- Connector -->
          <div
            v-if="index < steps.length - 1"
            class="relative mt-5 h-px min-w-3 flex-1"
            :class="index < currentStep ? 'bg-[#D71920]' : 'bg-slate-200'"
            aria-hidden="true"
          />
        </template>
      </div>
    </div>

    <!-- Mobile Stepper -->
    <div class="sm:hidden">
      <!-- Progress Bar -->
      <div class="flex items-center gap-1">
        <template v-for="(_, index) in steps" :key="index">
          <div
            class="h-1.5 flex-1 rounded-full transition"
            :class="index <= currentStep ? 'bg-[#D71920]' : 'bg-slate-200'"
          />
        </template>
      </div>

      <!-- Current Step Info -->
      <div class="mt-4 flex items-center justify-between">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">
            {{ currentStepData.title }}
          </p>

          <p class="mt-0.5 truncate text-xs text-slate-500">
            {{ currentStepData.description }}
          </p>
        </div>

        <p class="ml-4 shrink-0 text-xs font-medium text-slate-500">
          {{ currentStep + 1 }} / {{ steps.length }}
        </p>
      </div>
    </div>
  </div>
</template>
