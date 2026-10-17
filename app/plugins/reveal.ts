import { defineNuxtPlugin } from "#app";

/**
 * Directive `v-reveal` untuk animasi scroll-reveal.
 *
 * Elemen dengan directive akan diberi class `.in` saat masuk viewport
 * (sekali saja). Tambahkan delay opsional: `v-reveal="0.08"`.
 *
 * Elemen render tetap terlihat saat SSR (tanpa class `.reveal` efek
 * transisi tetap netral), lalu di sisi client directive menyembunyikannya
 * sebentar sebelum reveal — sesuai perilaku desain asli.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", {
    getSSRProps(binding) {
      // Saat SSR, terapkan class reveal + delay agar hidrasi mulus.
      const delay = typeof binding.value === "number" ? binding.value : 0;
      return {
        class: ["reveal", { in: false }],
        style: { "--d": `${delay}s` },
      };
    },
    mounted(el: HTMLElement, binding) {
      const delay = typeof binding.value === "number" ? binding.value : 0;
      el.classList.add("reveal");
      el.style.setProperty("--d", `${delay}s`);

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reducedMotion || !("IntersectionObserver" in window)) {
        el.classList.add("in");
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              el.classList.add("in");
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );

      observer.observe(el);
    },
  });
});
