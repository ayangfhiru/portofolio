import { defineNuxtPlugin } from "#app";

/**
 * Directive `v-reveal` untuk animasi scroll-reveal.
 *
 * Class dasar `reveal` (state awal: transisi netral) DITULIS STATIS DI
 * TEMPLATE, bukan lewat directive. Alasannya: `getSSRProps` hanya dipanggil
 * saat server merender, sehingga class yang dihasilkannya tidak pernah ada
 * di vdom client — perbandingan hidrasi dilakukan sebelum hook `mounted`
 * berjalan dan tetap memunculkan "hydration class mismatch" walaupun
 * `mounted` menambahkan class yang sama sesudahnya.
 *
 * Directive ini murni sisi client dan hanya mengurus dua hal yang tidak
 * bisa diekspresikan di template:
 *
 *   - `--d` : delay animasi dari nilai binding (`v-reveal="0.08"`).
 *   - `in`  : status akhir animasi, ditambahkan IntersectionObserver di
 *             sisi client setelah elemen mount (sekali saja).
 *
 * `getSSRProps` sengaja TIDAK dipakai. Menyuntikkan `--d` lewat sana hanya
 * memindahkan masalahnya: elemen yang sudah punya atribut `style` statis
 * (mis. QuoteSection) akan memunculkan "Hydration style mismatch", karena
 * `--d` ada di HTML server tetapi tidak pernah ada di vdom client. `--d`
 * cukup disetel `mounted` — transisi baru berjalan setelah `.in` diberikan
 * IntersectionObserver, jadi delay-nya sudah benar pada saat itu.
 *
 * Tambahkan delay opsional: `v-reveal="0.08"`.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("reveal", {
    mounted(el: HTMLElement, binding) {
      const delay = typeof binding.value === "number" ? binding.value : 0;
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
