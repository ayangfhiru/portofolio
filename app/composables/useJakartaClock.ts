import { onMounted, onUnmounted, ref } from "vue";
import { formatJakartaClock } from "~/utils";

/** Jam live WIB yang diperbarui tiap detik. */
export const useJakartaClock = () => {
  const clock = ref("--:--:--");
  let timer: ReturnType<typeof setInterval> | undefined;

  onMounted(() => {
    const tick = () => {
      clock.value = formatJakartaClock();
    };
    tick();
    timer = setInterval(tick, 1000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { clock };
};
