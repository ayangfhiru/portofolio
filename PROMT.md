# Task: Investigasi dan Perbaikan Error Better Auth 403 INVALID_ORIGIN

## Konteks

Aplikasi menggunakan Nuxt, TypeScript, Better Auth, dan database PostgreSQL. Aplikasi dijalankan secara lokal dan di-deploy ke Netlify, dengan domain yang dapat menggunakan Cloudflare.

Saat melakukan login, request berikut mendapatkan respons `403 Forbidden`:

- Method: `POST`
- Endpoint: `/api/auth/sign-in/email`
- Error sebelumnya: `{"message":"Invalid origin","code":"INVALID_ORIGIN"}`

Terdapat variabel environment untuk URL Better Auth dan daftar origin tepercaya. Daftar origin harus mendukung pemisah koma (`,`) maupun titik koma (`;`).

## Tujuan

Lakukan audit kode, identifikasi akar masalah, perbaiki konfigurasi yang salah, dan pastikan seluruh variabel environment yang diperlukan didokumentasikan di `.env.example`.

## 1. Audit konfigurasi Better Auth

Periksa implementasi Better Auth di seluruh proyek, terutama:

- File konfigurasi Better Auth di sisi server.
- Endpoint handler Better Auth pada Nuxt/Nitro.
- Konfigurasi `baseURL`.
- Konfigurasi `trustedOrigins`.
- Integrasi login dan registrasi di frontend.
- Penggunaan `process.env`, `runtimeConfig`, dan `useRuntimeConfig()`.
- Konfigurasi environment variables di Netlify yang dapat diverifikasi dari repository atau dokumentasi proyek.

Jangan langsung mengubah kode sebelum memahami implementasi yang sudah ada. Hindari membuat konfigurasi Better Auth duplikat.

## 2. Periksa dan perbaiki trustedOrigins

Pastikan daftar origin diambil dari variabel environment `BETTER_AUTH_TRUSTED_ORIGINS`.

Gunakan implementasi yang mendukung pemisah koma dan titik koma, menghapus spasi, serta membuang entri kosong.

Contoh:

```ts
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(/[,;]/)
  .map((origin) => origin.trim())
  .filter(Boolean);
```

Sesuaikan implementasi dengan pola konfigurasi Nuxt yang digunakan proyek. Jika proyek menggunakan `runtimeConfig`, gunakan konfigurasi server-side yang sesuai dan hindari membaca konfigurasi dari sisi client.

Pastikan `trustedOrigins` diberikan ke instance Better Auth yang benar-benar digunakan oleh endpoint autentikasi.

## 3. Audit penyebab HTTP 403

Periksa kemungkinan penyebab berikut:

1. Origin browser tidak cocok dengan daftar `trustedOrigins`.
2. Variabel environment tidak tersedia pada runtime production.
3. `BETTER_AUTH_URL` menggunakan domain atau protokol yang salah.
4. Terdapat perbedaan antara domain utama, subdomain `www`, domain Netlify, dan domain kustom.
5. Konfigurasi `baseURL` atau `trustedOrigins` tidak terbaca dengan benar setelah deployment.
6. Frontend mengirim request ke host yang berbeda dari host aplikasi.
7. Ada middleware, reverse proxy, konfigurasi Cloudflare, atau handler Nitro yang memengaruhi request.

Jangan menyimpulkan bahwa Cloudflare adalah penyebab tanpa bukti.

Periksa juga `Origin`, `Host`, dan `X-Forwarded-Host` jika tersedia, tetapi jangan mempercayai header forwarding dari sumber yang tidak tepercaya.

Jangan memperbaiki masalah dengan menonaktifkan validasi origin, menambahkan wildcard yang terlalu luas, atau mengizinkan semua domain.

## 4. Perbarui `.env.example`

Tambahkan atau perbarui dokumentasi variabel berikut sesuai implementasi yang benar-benar digunakan proyek:

```env
# Better Auth
BETTER_AUTH_SECRET=replace-with-a-secure-random-secret
BETTER_AUTH_URL=http://localhost:3000

# Comma- or semicolon-separated list of trusted origins
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,https://your-domain.example
```

Jika proyek menggunakan `NUXT_SESSION_PASSWORD`, `DATABASE_URL`, atau variabel autentikasi lain, pertahankan dan dokumentasikan variabel tersebut sesuai kebutuhan implementasi saat ini.

Ketentuan:

- Jangan membaca, menampilkan, menyalin, atau mengubah nilai rahasia dari `.env`.
- Jangan menimpa file `.env`.
- Jangan memasukkan credential atau secret asli ke `.env.example`.
- Gunakan placeholder yang aman.
- Jangan membuat variabel environment baru jika variabel yang setara sudah digunakan tanpa alasan teknis yang jelas.
- Pastikan nama variabel pada `.env.example` sama dengan yang dibaca kode.

## 5. Validasi environment

Pastikan konfigurasi production menggunakan origin aktual yang diperlukan, misalnya:

- `https://your-domain.example`
- `https://www.your-domain.example`, jika digunakan.
- URL deployment Netlify, jika memang diperlukan dan diakses pengguna.

Jangan mengasumsikan semua origin tersebut wajib diizinkan. Pilih hanya origin yang benar-benar digunakan oleh aplikasi.

Jangan mencetak nilai secret ke terminal, log, atau laporan. Untuk debugging, tampilkan hanya informasi nonrahasia seperti nama variabel tersedia/tidak tersedia dan daftar origin yang telah disanitasi.

## 6. Pengujian

Jalankan pemeriksaan yang tersedia di proyek menggunakan pnpm, antara lain:

- TypeScript atau `vue-tsc`, jika dikonfigurasi.
- ESLint.
- Build production.
- Pengujian autentikasi yang sudah tersedia.

Periksa bahwa:

- Origin yang diizinkan dapat melakukan request autentikasi.
- Origin yang tidak diizinkan tetap ditolak.
- Login dan registrasi tidak mengalami regresi.
- Konfigurasi lokal dan production tidak saling tertukar.
- Endpoint autentikasi tetap menggunakan konfigurasi Better Auth yang sama.

Jika tidak tersedia environment production atau akses ke dashboard Netlify, jelaskan bagian yang belum dapat diverifikasi. Jangan mengklaim bahwa login production telah berhasil jika belum diuji.

## 7. Aturan implementasi

Ikuti konvensi proyek:

- Gunakan TypeScript dengan tipe yang jelas.
- Gunakan arrow functions untuk fungsi baru.
- Pisahkan tipe/interface ke file khusus jika diperlukan.
- Gunakan alias `~` jika sesuai dengan konfigurasi proyek.
- Hindari duplikasi kode dan konfigurasi.
- Jangan mengubah bagian aplikasi yang tidak terkait.
- Jangan menghapus validasi keamanan untuk mengatasi error.

## 8. Laporan hasil

Setelah selesai, berikan laporan yang mencakup:

1. Akar masalah yang ditemukan beserta bukti dari kode atau hasil pengujian.
2. File yang diperiksa dan diubah.
3. Perubahan konfigurasi Better Auth.
4. Variabel yang ditambahkan atau diperbarui di `.env.example`.
5. Hasil TypeScript, lint, build, dan pengujian yang benar-benar dijalankan.
6. Environment variables yang perlu dikonfigurasi secara manual di Netlify.
7. Langkah redeploy dan verifikasi login production.
8. Masalah yang belum dapat dipastikan karena keterbatasan akses.

Mulai dengan memeriksa struktur proyek dan konfigurasi autentikasi yang sudah ada. Lakukan perubahan sesedikit mungkin, berdasarkan bukti, dan jangan mengubah `.env` asli.
