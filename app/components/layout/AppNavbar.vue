<script setup lang="ts">
/**
 * Navbar fixed di atas: brand, link section (scroll-spy), CTA,
 * progress bar scroll, dan tombol burger untuk mobile.
 */
import { ref } from "vue";
import AppButton from "~/components/ui/AppButton.vue";
import { useScrollProgress } from "~/composables/useScrollProgress";
import { NAV_LINKS } from "~/utils/navigation";

const props = defineProps<{ menuOpen: boolean }>();
const emit = defineEmits<{ toggleMenu: [] }>();

const { progress, isStuck } = useScrollProgress();

/** Section yang sedang aktif di viewport (scroll-spy). */
const activeSection = ref<string>("home");

onMounted(() => {
  const sections = document.querySelectorAll<HTMLElement>("section[id]");
  if (!("IntersectionObserver" in window)) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id;
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );

  sections.forEach((section) => spy.observe(section));
  onUnmounted(() => spy.disconnect());
});
</script>

<template>
  <!-- Progress bar gradient di paling atas -->
  <div
    class="fixed left-0 top-0 z-[9999] h-0.5 bg-gradient-to-r from-accent to-flare"
    :style="{ width: `${progress}%` }"
    aria-hidden="true"
  />

  <header
    class="fixed inset-x-0 top-0 z-[900] border-b border-transparent transition-[background,border-color,backdrop-filter] duration-[400ms] ease-[cubic-bezier(.22,.9,.28,1)]"
    :class="
      isStuck && 'border-line bg-bg/80 backdrop-blur-2xl backdrop-saturate-150'
    "
  >
    <div
      class="mx-auto flex h-[74px] w-[min(1240px,100%-48px)] items-center justify-between gap-5 max-[680px]:w-[min(1240px,100%-32px)]"
    >
      <a href="#home" class="flex items-center gap-[11px]">
        <span
          class="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-accent font-mono text-[0.82rem] font-bold text-accent-ink"
          >&lt;/&gt;</span
        >
        <span
          class="font-display text-[1.12rem] font-extrabold tracking-[-0.02em]"
          >ghege.dev</span
        >
      </a>

      <nav class="flex items-center gap-1.5 max-[980px]:hidden">
        <a
          v-for="link in NAV_LINKS"
          :key="link.href"
          :href="link.href"
          class="rounded-full px-3.5 py-[9px] font-mono text-[0.78rem] uppercase tracking-[0.06em] transition-[color,background] duration-[250ms] ease-[cubic-bezier(.22,.9,.28,1)]"
          :class="
            activeSection === link.href.slice(1)
              ? 'text-accent'
              : 'text-muted hover:bg-white/5 hover:text-ink'
          "
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-3">
        <AppButton variant="ghost" href="#contact" class="max-[980px]:hidden">
          Download CV
        </AppButton>
        <AppButton variant="primary" href="#contact"> Hire me </AppButton>

        <button
          class="relative hidden h-11 w-11 rounded-xl border border-line-strong max-[980px]:block"
          :aria-label="props.menuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="props.menuOpen"
          @click="emit('toggleMenu')"
        >
          <span
            class="absolute left-3 h-0.5 w-5 bg-ink transition-all duration-[320ms] ease-[cubic-bezier(.22,.9,.28,1)]"
            :class="props.menuOpen ? 'top-[21px] rotate-45' : 'top-[17px]'"
          />
          <span
            class="absolute left-3 h-0.5 bg-ink transition-all duration-[320ms] ease-[cubic-bezier(.22,.9,.28,1)]"
            :class="
              props.menuOpen ? 'top-[21px] w-5 -rotate-45' : 'top-6 w-[13px]'
            "
          />
        </button>
      </div>
    </div>
  </header>
</template>
