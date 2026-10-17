/**
 * Bentuk respons standar untuk semua endpoint API.
 * Menjaga konsistensi response di seluruh aplikasi.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  /** Hanya diisi saat `success: false`. */
  error?: string;
}
