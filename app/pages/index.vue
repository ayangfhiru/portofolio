<script setup lang="ts">
/**
 * Halaman utama portfolio.
 * Hanya mengatur state menu mobile dan merangkai section-section.
 */
import { ref } from "vue";
import { AppFooter, AppNavbar, MobileMenu } from "~/components/layout";
import {
  AboutSection,
  ContactSection,
  ExperienceSection,
  HeroSection,
  QuoteSection,
  ServicesSection,
  StackSection,
  WorkSection,
} from "~/components/sections";

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
