# Prompt: Implementasi Register dan Login dengan Better Auth pada Nuxt.js

## 1. Tujuan

Buat sistem autentikasi menggunakan **Better Auth** pada aplikasi Nuxt.js dengan metode autentikasi email dan password.

Fitur yang harus tersedia:

- Register akun menggunakan nama, email, dan password.
- Login menggunakan email dan password.
- Logout dari akun yang sedang aktif.
- Memeriksa status autentikasi pengguna.
- Mengelola session pengguna.
- Melindungi halaman yang memerlukan autentikasi.
- Melindungi endpoint API dari pengguna yang belum terautentikasi.
- Menangani validasi, error, dan loading state dengan benar.

Implementasikan fitur secara nyata dan terintegrasi dengan database, bukan sekadar membuat UI atau mockup.

## 2. Teknologi

Gunakan teknologi berikut:

- **Framework:** Nuxt.js dengan Nuxt 3 atau Nuxt 4 sesuai versi proyek yang sudah tersedia.
- **Authentication:** Better Auth.
- **Database:** Prisma ORM dengan database yang sudah digunakan proyek.
- **Styling:** Tailwind CSS mengikuti konfigurasi proyek yang tersedia.
- **Language:** TypeScript dengan strict typing.
- **Validation:** Gunakan library validasi yang sudah tersedia. Jika belum ada, gunakan Zod.
- **Code style:** Gunakan arrow function untuk fungsi yang dibuat, misalnya `const handleLogin = async () => {}`.

Jangan mengganti framework, package manager, database, atau library yang sudah digunakan tanpa alasan teknis yang kuat.

Sebelum melakukan perubahan, periksa struktur folder, `package.json`, konfigurasi Nuxt, Prisma schema, dan dependensi yang tersedia.

## 3. Konfigurasi Better Auth

Implementasikan Better Auth menggunakan pola integrasi resmi yang sesuai dengan versi paket yang terpasang.

Persyaratan:

- Buat instance Better Auth pada sisi server.
- Konfigurasikan Prisma adapter dengan provider database yang sesuai.
- Aktifkan autentikasi email dan password.
- Gunakan environment variable untuk konfigurasi rahasia dan URL aplikasi.
- Pastikan URL base Better Auth sesuai dengan domain aplikasi.
- Sediakan endpoint handler Better Auth pada server Nuxt.
- Pastikan cookie dan session dikonfigurasi dengan aman sesuai lingkungan development dan production.
- Jangan menyimpan password dalam bentuk plaintext.
- Jangan membuat sistem hashing password atau session sendiri apabila sudah ditangani Better Auth.

Gunakan dokumentasi resmi Better Auth sebagai acuan implementasi:
https://www.better-auth.com/docs

Periksa kompatibilitas API berdasarkan versi Better Auth yang terpasang. Jangan menggunakan API lama atau mengarang nama fungsi, konfigurasi, maupun endpoint.

## 4. Struktur Folder

Ikuti struktur proyek yang sudah ada. Jika belum ada struktur khusus, gunakan struktur yang memisahkan autentikasi, validasi, API, dan UI.

Contoh struktur:

```text
app/
├── components/
│   └── auth/
│       ├── LoginForm.vue
│       └── RegisterForm.vue
├── composables/
│   └── useAuth.ts
├── middleware/
│   ├── auth.ts
│   └── guest.ts
├── pages/
│   ├── login.vue
│   ├── register.vue
│   └── dashboard.vue
server/
├── api/
│   └── auth/
│       └── [...all].ts
├── utils/
│   └── auth.ts
utils/
└── validators/
    └── auth.ts
prisma/
└── schema.prisma
```

Struktur di atas merupakan referensi. Sesuaikan dengan konvensi Nuxt dan struktur proyek aktual. Jangan menduplikasi instance Better Auth atau membuat abstraksi yang tidak diperlukan.

## 5. Fitur Register

Buat halaman register dengan field:

- Nama lengkap.
- Email.
- Password.
- Konfirmasi password.

Persyaratan implementasi:

1. Validasi seluruh input pada sisi client untuk pengalaman pengguna.
2. Lakukan validasi yang diperlukan pada sisi server.
3. Pastikan format email valid.
4. Pastikan password memenuhi kebijakan keamanan yang ditentukan.
5. Pastikan konfirmasi password sama dengan password.
6. Cegah pengiriman form berulang ketika request sedang diproses.
7. Tampilkan indikator loading ketika proses register berlangsung.
8. Tampilkan pesan error yang mudah dipahami.
9. Tangani email yang sudah terdaftar tanpa membocorkan informasi sensitif secara berlebihan.
10. Gunakan API register resmi Better Auth untuk email dan password.
11. Setelah registrasi berhasil, arahkan pengguna sesuai perilaku verifikasi email dan session yang dikonfigurasi.
12. Jangan menganggap registrasi selalu menghasilkan session aktif jika konfigurasi atau kebijakan verifikasi email tidak mengizinkannya.

Jangan membuat endpoint register khusus apabila API Better Auth yang tersedia sudah memenuhi kebutuhan.

## 6. Fitur Login

Buat halaman login dengan field:

- Email.
- Password.
- Checkbox opsional untuk mengingat preferensi tampilan form, jika dibutuhkan. Jangan menambahkan fitur remember-me khusus tanpa memahami perilaku session Better Auth.

Persyaratan implementasi:

1. Validasi format email dan input wajib.
2. Gunakan API login resmi Better Auth.
3. Tampilkan loading state.
4. Tangani email atau password yang salah dengan pesan yang aman.
5. Tangani kegagalan jaringan dan respons error.
6. Cegah pengiriman request berulang selama proses login.
7. Pertahankan session melalui mekanisme cookie Better Auth.
8. Setelah login berhasil, arahkan pengguna ke halaman tujuan yang valid atau dashboard.
9. Validasi parameter redirect agar tidak menghasilkan open redirect ke domain eksternal.
10. Jangan menyimpan password, token session, atau kredensial autentikasi dalam localStorage.

## 7. Logout dan Status Session

Implementasikan fitur logout dan pemeriksaan session.

Persyaratan:

- Sediakan fungsi logout menggunakan API resmi Better Auth.
- Hapus atau invalidasi session melalui mekanisme resmi Better Auth.
- Arahkan pengguna ke halaman login setelah logout berhasil.
- Tampilkan status autentikasi yang konsisten antara navigasi dan halaman.
- Ambil informasi pengguna dari session yang telah diverifikasi.
- Tangani session kedaluwarsa dan session yang tidak lagi valid.
- Hindari request pemeriksaan session yang tidak diperlukan secara berulang.

Buat composable `useAuth` jika memang membantu menyatukan akses session, status loading, dan fungsi logout. Jangan membuat penyimpanan session buatan yang terpisah dari Better Auth.

## 8. Middleware dan Proteksi Halaman

Implementasikan middleware autentikasi sesuai arsitektur Nuxt yang digunakan.

### Guest middleware

Gunakan untuk halaman login dan register.

- Jika pengguna sudah terautentikasi, arahkan ke dashboard.
- Jika belum terautentikasi, izinkan pengguna mengakses halaman tersebut.

### Auth middleware

Gunakan untuk halaman dashboard dan halaman privat lainnya.

- Periksa session pengguna.
- Jika session tidak valid atau tidak tersedia, arahkan ke halaman login.
- Pertahankan tujuan halaman yang diminta secara aman jika diperlukan.

Perhatikan bahwa middleware client-side hanya mengatur navigasi dan bukan batas keamanan utama.

**Semua endpoint server yang bersifat privat harus memverifikasi session pada sisi server.** Jangan mengandalkan middleware halaman sebagai pengganti autentikasi endpoint API.

## 9. Database dan Prisma

Periksa Prisma schema yang sudah ada sebelum melakukan perubahan.

Persyaratan:

- Gunakan Prisma adapter resmi Better Auth yang kompatibel dengan versi terpasang.
- Pastikan model yang diperlukan Better Auth tersedia, seperti user, session, account, dan verification sesuai skema versi yang digunakan.
- Pertahankan relasi, model, dan data bisnis yang sudah ada.
- Jangan menghapus atau mengganti model yang tidak berkaitan dengan autentikasi.
- Buat migrasi database jika diperlukan.
- Jangan menjalankan migrasi destruktif tanpa persetujuan.
- Jangan mengarang skema Better Auth berdasarkan versi dokumentasi yang berbeda.

Pastikan registrasi, login, session, dan logout benar-benar bekerja dengan database.

## 10. UI dan UX

Buat halaman login dan register yang konsisten dengan desain aplikasi.

Persyaratan:

- Gunakan Tailwind CSS sesuai konfigurasi yang sudah tersedia.
- Buat tampilan responsif untuk desktop dan perangkat mobile.
- Sediakan label untuk setiap input.
- Sediakan indikator fokus keyboard.
- Sediakan tombol untuk menampilkan atau menyembunyikan password.
- Tampilkan pesan validasi dekat dengan field yang relevan.
- Gunakan tombol submit dengan loading state.
- Sediakan navigasi antara halaman login dan register.
- Gunakan komponen bersama untuk field atau elemen form yang berulang jika memang diperlukan.
- Jangan mengubah desain global atau token warna proyek tanpa kebutuhan.

Pastikan tampilan tetap dapat digunakan saat terjadi error, loading, maupun ketika form belum valid.

## 11. Keamanan

Terapkan praktik keamanan berikut:

- Jangan pernah mengekspos secret Better Auth ke client.
- Jangan mengembalikan password hash, token session, atau data internal sensitif melalui API.
- Gunakan HTTPS pada production.
- Gunakan cookie dengan pengaturan keamanan yang sesuai.
- Pastikan endpoint privat memverifikasi session di server.
- Hindari open redirect.
- Jangan menonaktifkan proteksi keamanan Better Auth hanya untuk mempermudah development.
- Terapkan pembatasan percobaan login atau rate limiting bila sesuai dengan infrastruktur aplikasi.
- Jangan menambahkan mekanisme autentikasi kedua yang bertentangan dengan Better Auth.
- Hindari mencatat password, cookie, token, atau kredensial pada log.
- Pastikan validasi client tidak dianggap sebagai pengganti validasi server.

## 12. Error Handling

Tangani setidaknya kondisi berikut:

- Email tidak valid.
- Field wajib kosong.
- Password tidak memenuhi kebijakan.
- Konfirmasi password tidak cocok.
- Email sudah digunakan.
- Kredensial login salah.
- Session tidak valid atau kedaluwarsa.
- Koneksi database gagal.
- Request jaringan gagal.
- Pengguna mencoba mengakses halaman privat tanpa autentikasi.

Gunakan tipe error dan respons yang sesuai dengan versi Better Auth. Hindari penggunaan `any`, type assertion yang tidak perlu, dan pesan error mentah yang membocorkan detail internal.

## 13. Standarisasi Kode

Ikuti ketentuan berikut:

- Gunakan TypeScript strict.
- Gunakan arrow function untuk fungsi yang dibuat.
- Hindari duplikasi kode.
- Pisahkan tanggung jawab UI, validasi, autentikasi, dan akses database.
- Ikuti aturan penamaan serta alias import proyek.
- Jika proyek menggunakan aturan barrel export, ikuti aturan tersebut secara konsisten.
- Hindari membuat file atau abstraksi yang tidak memiliki manfaat nyata.
- Jangan mengubah file yang tidak berkaitan dengan fitur autentikasi.
- Jangan menonaktifkan pemeriksaan TypeScript atau lint hanya agar implementasi lolos.

## 14. Pengujian dan Verifikasi

Setelah implementasi:

1. Jalankan pemeriksaan TypeScript yang sesuai.
2. Jalankan lint jika tersedia.
3. Jalankan build aplikasi.
4. Periksa kesesuaian Prisma schema dan migrasi.
5. Verifikasi alur register.
6. Verifikasi login dengan kredensial benar dan salah.
7. Verifikasi logout.
8. Verifikasi session setelah halaman dimuat ulang.
9. Verifikasi akses halaman privat tanpa session.
10. Verifikasi akses endpoint privat tanpa autentikasi.
11. Periksa redirect setelah login dan logout.
12. Perbaiki error yang ditemukan tanpa mengubah konfigurasi yang tidak relevan.

Jangan menyatakan pengujian berhasil jika perintah atau skenario tersebut belum benar-benar dijalankan.

## 15. Hasil Akhir

Setelah implementasi, berikan ringkasan yang mencakup:

- File yang dibuat dan diubah.
- Konfigurasi Better Auth yang digunakan.
- Perubahan Prisma schema dan migrasi.
- Environment variable yang harus diisi.
- Perintah instalasi atau migrasi yang diperlukan.
- Cara menjalankan aplikasi.
- Cara menguji register, login, logout, dan proteksi halaman.
- Hasil pemeriksaan TypeScript, lint, build, dan pengujian.
- Hal yang masih memerlukan konfigurasi manual.

## Instruksi Utama

Kerjakan implementasi langsung berdasarkan kondisi proyek yang tersedia.

Sebelum menulis kode, periksa dokumentasi resmi dan versi dependensi. Implementasikan autentikasi secara end-to-end dengan pola API Better Auth yang benar.

Jangan hanya memberikan contoh kode atau rencana implementasi. Buat dan sesuaikan file yang diperlukan, pertahankan kode yang sudah ada, dan laporkan hasil pekerjaan berdasarkan apa yang benar-benar berhasil dijalankan.
