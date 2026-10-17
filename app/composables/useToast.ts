import { ref } from "vue";

/**
 * Notifikasi toast untuk panel admin.
 *
 * Daftar toast disimpan pada level modul sehingga seluruh halaman
 * berbagi satu antrean yang sama — komponen `AppToast` hanya perlu
 * dirender sekali di halaman admin.
 */

export type ToastType = "ok" | "danger";

export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
}

/** Jeda sebelum toast tertutup otomatis (ms). */
const TOAST_DURATION_MS = 3200;

const toasts = ref<ToastItem[]>([]);
const timers = new Map<number, ReturnType<typeof setTimeout>>();
let nextId = 1;

export const useToast = () => {
  /** Tutup satu toast beserta timer-nya. */
  const dismiss = (id: number): void => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);

    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  };

  /** Tampilkan toast baru dan kembalikan ID-nya. */
  const push = (
    title: string,
    description?: string,
    type: ToastType = "ok",
  ): number => {
    const id = nextId++;

    toasts.value = [...toasts.value, { id, title, description, type }];
    timers.set(id, setTimeout(() => dismiss(id), TOAST_DURATION_MS));

    return id;
  };

  const success = (title: string, description?: string): number =>
    push(title, description, "ok");

  const danger = (title: string, description?: string): number =>
    push(title, description, "danger");

  return { toasts, push, success, danger, dismiss };
};
