<script setup lang="ts">
/**
 * Halaman utama portfolio.
 * Hanya mengatur state menu mobile dan merangkai section-section.
 */
import { ref } from "vue";
import AppFooter from "~/components/layout/AppFooter.vue";
import AppNavbar from "~/components/layout/AppNavbar.vue";
import MobileMenu from "~/components/layout/MobileMenu.vue";
import AboutSection from "~/components/sections/AboutSection.vue";
import ContactSection from "~/components/sections/ContactSection.vue";
import ExperienceSection from "~/components/sections/ExperienceSection.vue";
import HeroSection from "~/components/sections/HeroSection.vue";
import QuoteSection from "~/components/sections/QuoteSection.vue";
import ServicesSection from "~/components/sections/ServicesSection.vue";
import StackSection from "~/components/sections/StackSection.vue";
import WorkSection from "~/components/sections/WorkSection.vue";

useHead({
  title: "Syang Ghege — Full-Stack Developer & Product Engineer",
  meta: [
    {
      name: "description",
      content:
        "Portfolio of Syang Ghege, full-stack developer building fast, scalable, and beautiful digital products.",
    },
  ],
});

const menuOpen = ref(false);
</script>

<template>
  <div class="min-h-screen bg-bg text-ink">
    <AppNavbar :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />
    <MobileMenu :open="menuOpen" @close="menuOpen = false" />

    <main>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <StackSection />
      <WorkSection />
      <ExperienceSection />
      <QuoteSection />
      <ContactSection />
    </main>

    <AppFooter />
  </div>
</template>
