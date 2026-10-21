import { createAuthClient } from "better-auth/vue";
import { computed, ref } from "vue";
import type { LoginFormValues, RegisterFormValues } from "~/utils";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "~/utils";

/**
 * Composable autentikasi — satu pintu untuk membaca sesi, menampilkan
 * status memuat, dan menjalankan masuk/keluar.
 *
 * Klien Better Auth dibuat sekali pada tingkat modul. Atom sesi di
 * dalamnya tidak pernah di-subscribe di sisi server karena pembacaan
 * sesi memakai `useRequestFetch` (lihat `fetchSession`), sehingga tidak
 * ada state sesi milik satu request yang terbawa ke request SSR
 * berikutnya.
 */
const authClient = createAuthClient();

/** Bentuk sesi hasil `GET /api/auth/get-session` Better Auth. */
type AuthSession = typeof authClient.$Infer.Session;

/**
 * Bentuk minimal error dari klien Better Auth.
 *
 * Ditulis dengan seluruh properti opsional sehingga objek error nyata
 * dari Better Auth dapat diteruskan tanpa perlu type assertion.
 */
interface AuthClientError {
  code?: string;
  message?: string;
  status?: number;
}

/**
 * Hasil sebuah aksi autentikasi.
 *
 * `authenticated` adalah status sesi **sesudah** aksi dijalankan, bukan
 * sekadar tanda "request tidak error" — pemanggil tidak pernah
 * menganggap masuk/daftar berhasil hanya karena tidak ada pesan galat.
 */
export interface AuthActionResult {
  /** Pesan siap tampil, atau `null` bila berhasil. */
  error: string | null;
  /** Apakah sesi aktif setelah aksi selesai. */
  authenticated: boolean;
}

/**
 * Pesan ramah pengguna untuk kode error bawaan Better Auth 1.7.
 *
 * Hanya kode yang benar-benar dipakai Better Auth untuk alur email +
 * password yang dipetakan; pesan mentah dari server sengaja tidak
 * ditampilkan langsung agar bahasa dan detailnya tetap terkendali.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email atau password salah.",
  INVALID_PASSWORD: "Email atau password salah.",
  INVALID_USER: "Email atau password salah.",
  USER_NOT_FOUND: "Email atau password salah.",
  INVALID_EMAIL: "Alamat email tidak valid.",
  PASSWORD_TOO_SHORT: `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`,
  PASSWORD_TOO_LONG: `Password maksimal ${PASSWORD_MAX_LENGTH} karakter.`,
  USER_ALREADY_EXISTS: "Email sudah terdaftar. Silakan masuk.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email sudah terdaftar. Silakan masuk.",
  EMAIL_NOT_VERIFIED: "Email belum diverifikasi. Periksa kotak masuk Anda.",
  SESSION_EXPIRED: "Sesi berakhir. Silakan masuk kembali.",
};

const NETWORK_ERROR_MESSAGE =
  "Koneksi gagal. Periksa jaringan Anda lalu coba lagi.";
const GENERIC_ERROR_MESSAGE =
  "Permintaan tidak dapat diproses. Silakan coba lagi.";

/** Terjemahkan error Better Auth menjadi pesan yang aman ditampilkan. */
const mapAuthError = (error: AuthClientError): string => {
  if (error.code) {
    const message = AUTH_ERROR_MESSAGES[error.code];
    if (message) return message;
    return GENERIC_ERROR_MESSAGE;
  }

  // Tanpa kode, respons tidak pernah sampai utuh — umumnya jaringan
  // putus (status 0/absen) sehingga pesan jaringan lebih menggambarkan
  // keadaan daripada pesan galat generik.
  return (error.status ?? 0) < 500 ? NETWORK_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE;
};

export const useAuth = () => {
  // Diambil selama konteks Nuxt aktif (setup maupun middleware) supaya
  // cookie yang masuk tetap diteruskan selama SSR.
  const requestFetch = useRequestFetch();

  /**
   * Sesi hasil verifikasi.
   *
   * `undefined` berarti belum pernah diperiksa pada request/navigasi
   * ini, sehingga `verifySession` cukup memanggil server sekali lalu
   * memakai ulang hasilnya pada navigasi berikutnya.
   */
  const session = useState<AuthSession | null | undefined>(
    "auth:session",
    () => undefined,
  );

  const isLoading = ref(false);

  /** Pengguna yang sedang masuk, atau `null` bila tidak ada sesi. */
  const user = computed(() => session.value?.user ?? null);

  /**
   * Ambil sesi dari endpoint resmi Better Auth.
   *
   * Kegagalan apa pun — 401 karena belum masuk, jaringan putus, sampai
   * database tidak tersedia — diperlakukan sebagai "tidak ada sesi".
   * Keputusan ini disengaja: lebih baik menolak akses (gagal-tertutup)
   * daripada menganggap pengguna terautentikasi padahal tidak terbukti.
   * Otorisasi sesungguhnya tetap dipegang guard sisi server
   * (`server/middleware/auth.ts`), bukan state ini.
   */
  const fetchSession = async (): Promise<AuthSession | null> => {
    let next: AuthSession | null = null;

    try {
      const data = await requestFetch<AuthSession | null>(
        "/api/auth/get-session",
      );
      next = data?.user ? data : null;
    } catch {
      next = null;
    }

    session.value = next;
    return next;
  };

  /**
   * Pastikan sesi sudah diperiksa, lalu kembalikan hasilnya.
   *
   * Hasil pertama disimpan ke state sehingga pemeriksaan ulang pada
   * navigasi berikutnya tidak mengirim request baru.
   */
  const verifySession = async (): Promise<AuthSession | null> => {
    if (session.value !== undefined) return session.value;

    return await fetchSession();
  };

  /** Masuk ke akun menggunakan email dan password. */
  const signIn = async (
    values: LoginFormValues,
  ): Promise<AuthActionResult> => {
    if (isLoading.value) return { error: null, authenticated: false };

    isLoading.value = true;

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) return { error: mapAuthError(error), authenticated: false };

      const activeSession = await fetchSession();
      return { error: null, authenticated: activeSession !== null };
    } catch {
      return { error: NETWORK_ERROR_MESSAGE, authenticated: false };
    } finally {
      isLoading.value = false;
    }
  };

  /** Daftarkan akun baru. */
  const signUp = async (
    values: RegisterFormValues,
  ): Promise<AuthActionResult> => {
    if (isLoading.value) return { error: null, authenticated: false };

    isLoading.value = true;

    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) return { error: mapAuthError(error), authenticated: false };

      // Sesi hanya dianggap terbentuk bila benar-benar terbaca dari
      // server. Bila konfigurasi kelak menuntut verifikasi email,
      // hasil `false` ini yang menentukan pengguna diarahkan ke login
      // — asumsi "selalu masuk sesudah daftar" tidak dipakai.
      const activeSession = await fetchSession();
      return { error: null, authenticated: activeSession !== null };
    } catch {
      return { error: NETWORK_ERROR_MESSAGE, authenticated: false };
    } finally {
      isLoading.value = false;
    }
  };

  /** Akhiri sesi yang sedang aktif melalui API resmi Better Auth. */
  const signOut = async (): Promise<AuthActionResult> => {
    if (isLoading.value) return { error: null, authenticated: true };

    isLoading.value = true;

    try {
      const { error } = await authClient.signOut();

      if (error) return { error: mapAuthError(error), authenticated: true };

      session.value = null;
      return { error: null, authenticated: false };
    } catch {
      return { error: NETWORK_ERROR_MESSAGE, authenticated: true };
    } finally {
      isLoading.value = false;
    }
  };

  return {
    user,
    isLoading,
    verifySession,
    signIn,
    signUp,
    signOut,
  };
};
