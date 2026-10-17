import type { ApiResponse } from "../../app/types/api";

/**
 * Pembungkus response standar.
 * Semua endpoint mengembalikan bentuk `{ success, data, error? }`
 * agar frontend bisa menangani hasil dengan cara yang sama.
 */
export const ok = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const fail = <T>(data: T, error: string): ApiResponse<T> => ({
  success: false,
  data,
  error,
});
