import { onMounted, onUnmounted, ref } from "vue";
import { calculateScrollProgress } from "~/utils";

/**
 * Melacak progres scroll halaman (0–100) dan status "stuck"
 * untuk transparasi navbar.
 */
export const useScrollProgress = () => {
  const progress = ref(0);
  const isStuck = ref(false);

  const update = () => {
    progress.value = calculateScrollProgress(
      window.scrollY,
      window.innerHeight,
      document.documentElement.scrollHeight,
    );
    isStuck.value = window.scrollY > 24;
  };

  onMounted(() => {
    window.addEventListener("scroll", update, { passive: true });
    update();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", update);
  });

  return { progress, isStuck };
};
