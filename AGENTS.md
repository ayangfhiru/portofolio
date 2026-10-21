# AI Coding Standards & Project Guidelines

## 1. Tujuan Utama

Dokumen ini menjadi standar wajib bagi AI coding agent ketika membuat, mengubah, memperbaiki, atau merefaktor kode dalam project.

Setiap implementasi harus mengutamakan:

1. Konsistensi dengan arsitektur dan konvensi project yang sudah ada.
2. Keterbacaan kode agar mudah dipahami developer lain.
3. Penggunaan ulang komponen, fungsi, tipe, dan utilitas.
4. Pemisahan tanggung jawab yang jelas.
5. Implementasi yang sederhana, terstruktur, dan mudah dirawat.
6. Perubahan yang terukur dan sesuai dengan permintaan.
7. Keamanan, validasi, dan ketepatan pengelolaan data.
8. Menghindari abstraksi, dependency, dan kompleksitas yang tidak diperlukan.

**Prinsip utama:** buat kode yang mudah dibaca dan dipelihara, bukan sekadar kode yang berfungsi.

---

## 2. Aturan Sebelum Menulis Kode

Sebelum mengimplementasikan task, AI WAJIB:

1. Memeriksa struktur direktori project.
2. Membaca file yang berkaitan langsung dengan task.
3. Memeriksa `package.json` dan dependency yang sudah tersedia.
4. Mengidentifikasi pola implementasi yang sudah digunakan.
5. Memeriksa komponen, composable, utilitas, tipe, dan helper yang sudah tersedia.
6. Memeriksa schema database dan kontrak API apabila task berkaitan dengan data.
7. Menggunakan implementasi yang sudah ada jika sesuai dengan kebutuhan.
8. Mengidentifikasi batasan task sebelum melakukan perubahan.

Jangan membuat file, fungsi, komponen, atau dependency baru sebelum memastikan bahwa kebutuhan tersebut belum dapat dipenuhi dengan implementasi yang tersedia.

Jika terdapat informasi penting yang belum diketahui dan tidak dapat disimpulkan secara aman dari project, ajukan pertanyaan sebelum mengambil keputusan yang berpotensi mengubah arsitektur atau perilaku aplikasi.

---

## 3. Standar Struktur Direktori

Ikuti struktur direktori project yang sudah ada. Jangan memindahkan atau menyusun ulang seluruh project tanpa kebutuhan yang jelas.

Gunakan pemisahan tanggung jawab sesuai fungsi:

- `components/`: komponen UI yang dapat digunakan kembali.
- `composables/`: logika reaktif dan state yang digunakan oleh halaman atau komponen.
- `utils/`: fungsi utilitas umum yang dapat digunakan kembali.
- `types/` atau `shared/types/`: definisi tipe dan kontrak data bersama.
- `server/api/`: endpoint backend Nuxt/Nitro.
- `server/utils/`: helper khusus server.
- `pages/`: halaman dan routing aplikasi.
- `layouts/`: struktur layout halaman.
- `middleware/`: middleware aplikasi atau routing sesuai kebutuhan.
- `prisma/`: schema dan migrasi database apabila menggunakan Prisma.

Nama dan lokasi direktori harus disesuaikan dengan konvensi yang telah digunakan project.

Jangan membuat direktori baru hanya untuk satu fungsi sederhana apabila lokasi yang sudah tersedia lebih sesuai.

### 3.1. File Index pada Setiap Folder

Setiap folder modul yang memiliki file untuk diekspor WAJIB menyediakan `index.ts` sebagai entry point ekspor publik folder tersebut.

Gunakan `index.ts` untuk mengumpulkan ekspor dari file dalam folder yang sama.

Contoh struktur:

```text
components/
├── form/
│   ├── FormInput.vue
│   ├── FormSelect.vue
│   ├── FormTextarea.vue
│   └── index.ts
├── ui/
│   ├── BaseButton.vue
│   ├── BaseModal.vue
│   └── index.ts
└── index.ts
```

Contoh `components/form/index.ts`:

```ts
export { default as FormInput } from "./FormInput.vue";
export { default as FormSelect } from "./FormSelect.vue";
export { default as FormTextarea } from "./FormTextarea.vue";
```

Contoh `components/ui/index.ts`:

```ts
export { default as BaseButton } from "./BaseButton.vue";
export { default as BaseModal } from "./BaseModal.vue";
```

Contoh `utils/index.ts`:

```ts
export * from "./format";
export * from "./validation";
export * from "./date";
```

Contoh `composables/index.ts`:

```ts
export * from "./usePagination";
export * from "./useDebounce";
```

Contoh penggunaan:

```ts
import { FormInput, FormSelect } from "~/components/form";
import { formatCurrency } from "~/utils";
import { usePagination } from "~/composables";
```

Ketentuan:

1. Gunakan `export * from './nama_file'` untuk modul TypeScript yang menggunakan named export.
2. Gunakan `export { default as NamaKomponen } from './NamaKomponen.vue'` untuk komponen Vue dengan default export.
3. Jangan mengimpor file internal secara langsung jika file tersebut merupakan bagian dari API publik folder dan dapat diakses melalui `index.ts`.
4. Jangan menggunakan `export *` untuk komponen Vue yang hanya memiliki default export.
5. Hindari circular dependency antarfile maupun antarfolder.
6. Hindari konflik nama ekspor ketika menggabungkan beberapa modul.
7. Jangan mengekspor file internal, konstanta privat, atau implementasi yang tidak seharusnya digunakan oleh modul lain.
8. Pastikan `index.ts` diperbarui setiap kali ada modul publik baru atau modul yang dihapus.
9. Jangan membuat re-export bertingkat secara berlebihan jika membuat alur import sulit dilacak.
10. Jangan mengubah seluruh import lama secara massal apabila tidak diperlukan oleh task.

**Catatan:** aturan ini berlaku untuk folder modul yang menyediakan API ekspor publik. Folder aset, halaman routing, migrasi, dan folder khusus lainnya tidak harus dipaksakan menggunakan barrel export apabila tidak sesuai dengan cara kerja framework.

---

## 4. Standar Penulisan Fungsi

### 4.1. Gunakan Arrow Function

Fungsi baru WAJIB menggunakan arrow function dengan deklarasi `const`, kecuali ada alasan teknis yang mengharuskan bentuk lain.

Format standar:

```ts
const namaFungsi = () => {
  // Implementasi fungsi
};
```

Dengan parameter:

```ts
const getUserById = (id: string) => {
  // Implementasi fungsi
};
```

Dengan return value:

```ts
const formatName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`;
};
```

Fungsi asynchronous:

```ts
const fetchUser = async (id: string) => {
  // Implementasi asynchronous
};
```

Fungsi dengan return sederhana dapat menggunakan implicit return:

```ts
const isAdult = (age: number) => age >= 18;
```

Ketentuan:

1. Gunakan `const` sebagai deklarasi default fungsi.
2. Gunakan nama fungsi yang menjelaskan tujuannya.
3. Hindari nama ambigu seperti `processData`, `handleThing`, `doAction`, atau `tempFunction` jika tujuan sebenarnya dapat dijelaskan secara spesifik.
4. Hindari nested function yang terlalu dalam.
5. Pisahkan fungsi kompleks menjadi beberapa fungsi kecil jika meningkatkan keterbacaan.
6. Jangan membuat fungsi hanya untuk membungkus satu operasi sederhana jika tidak menambah kejelasan atau penggunaan ulang.
7. Jangan mengubah fungsi framework, lifecycle hook, callback library, atau API yang memang mengharuskan bentuk deklarasi tertentu secara sembarangan.

---

## 5. Standar Penempatan Fungsi di Utils

Fungsi yang bersifat umum, dapat digunakan kembali, dan tidak terikat pada satu komponen atau satu halaman HARUS dipertimbangkan untuk ditempatkan di `utils/`.

Contoh fungsi yang sesuai:

- Format mata uang.
- Format tanggal dan waktu.
- Format angka.
- Normalisasi string.
- Konversi data.
- Validasi sederhana yang tidak bergantung pada state komponen.
- Helper pengolahan array dan object.
- Fungsi pembentukan label dan nilai tampilan.
- Helper umum yang tidak membutuhkan runtime khusus.

Contoh struktur:

```text
utils/
├── format/
│   ├── currency.ts
│   ├── date.ts
│   └── index.ts
├── validation/
│   ├── string.ts
│   ├── number.ts
│   └── index.ts
└── index.ts
```

Contoh implementasi:

```ts
// utils/format/currency.ts

export const formatCurrency = (value: number, currency = "IDR") => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};
```

### Ketentuan penempatan fungsi

- Fungsi yang hanya digunakan satu kali dan sangat spesifik terhadap komponen dapat tetap berada di komponen tersebut.
- Logika reaktif yang bergantung pada `ref`, `computed`, lifecycle, atau state Vue lebih sesuai ditempatkan di `composables/` jika digunakan kembali.
- Logika HTTP endpoint dan helper backend yang bergantung pada runtime server harus berada di area server.
- Fungsi yang mengakses database harus tetap berada di lapisan server yang sesuai.
- Jangan memindahkan seluruh fungsi ke `utils/` hanya demi mengurangi jumlah baris pada komponen.
- Jangan membuat file utilitas generik yang berisi fungsi-fungsi tidak berkaitan.
- Hindari duplikasi logika. Jika fungsi yang setara sudah tersedia, gunakan fungsi tersebut.

Sebelum membuat fungsi baru, cari terlebih dahulu apakah implementasi serupa sudah tersedia.

---

## 6. Standar Penamaan

Gunakan penamaan yang konsisten dan deskriptif.

| Elemen                | Konvensi                       | Contoh              |
| --------------------- | ------------------------------ | ------------------- |
| File TypeScript       | camelCase                      | `formatCurrency.ts` |
| File composable       | `use` + PascalCase             | `usePagination.ts`  |
| Komponen Vue          | PascalCase                     | `FormInput.vue`     |
| Variabel              | camelCase                      | `userProfile`       |
| Fungsi                | camelCase                      | `getUserById`       |
| Konstanta konfigurasi | UPPER_SNAKE_CASE               | `MAX_UPLOAD_SIZE`   |
| Type dan Interface    | PascalCase                     | `UserProfile`       |
| Enum                  | PascalCase                     | `UserStatus`        |
| Event handler         | `handle` + aksi                | `handleSubmit`      |
| Boolean               | awalan `is`, `has`, atau `can` | `isLoading`         |

Ketentuan tambahan:

1. Nama harus menggambarkan tujuan atau isi.
2. Hindari singkatan yang tidak umum.
3. Gunakan istilah domain yang konsisten di seluruh project.
4. Jangan menggunakan nama berbeda untuk konsep yang sama.
5. Jangan mengganti nama publik yang sudah digunakan secara luas tanpa alasan yang kuat.

---

## 7. Standar Komponen Vue

Setiap komponen harus memiliki tanggung jawab yang jelas.

Ketentuan:

1. Gunakan kembali komponen yang tersedia sebelum membuat komponen baru.
2. Gunakan props untuk data yang diterima komponen.
3. Gunakan emits untuk mengomunikasikan kejadian kepada parent.
4. Hindari mutasi props secara langsung.
5. Hindari mengakses state parent melalui cara yang tidak eksplisit.
6. Pisahkan komponen presentasional dari logika bisnis yang kompleks jika diperlukan.
7. Hindari komponen dengan terlalu banyak tanggung jawab.
8. Hindari duplikasi template dan logika.
9. Gunakan slot jika dibutuhkan untuk variasi tampilan tanpa membuat banyak komponen serupa.
10. Jangan membuat komponen generik yang terlalu kompleks hanya untuk mengakomodasi kebutuhan hipotetis.
11. Ikuti gaya Composition API dan pola `<script setup>` apabila pola tersebut digunakan dalam project.
12. Jangan menambahkan state reaktif jika variabel biasa sudah cukup.

### Komponen Form

Untuk seluruh form:

- Gunakan komponen dari `components/form/` apabila tersedia.
- Konsisten dalam penggunaan label, placeholder, pesan validasi, dan error state.
- Terapkan validasi pada sisi client untuk pengalaman pengguna.
- Tetap validasi payload pada sisi server.
- Tampilkan loading selama proses submit.
- Cegah submit berulang ketika request masih berjalan.
- Pertahankan nilai input ketika request gagal.
- Jangan membuat sistem form kedua yang menduplikasi sistem yang sudah ada.

---

## 8. Standar TypeScript

Gunakan TypeScript secara konsisten jika project telah menggunakan TypeScript.

Ketentuan:

1. Hindari `any`.
2. Gunakan tipe eksplisit untuk parameter fungsi jika tipe tidak dapat diinferensikan dengan baik.
3. Tentukan return type untuk fungsi kompleks atau API publik apabila membantu kejelasan kontrak.
4. Gunakan `type` atau `interface` sesuai kebutuhan dan konvensi project.
5. Hindari deklarasi tipe yang sama di banyak file.
6. Pisahkan tipe yang digunakan lintas modul ke lokasi bersama yang sesuai.
7. Hindari penggunaan type assertion tanpa alasan yang jelas.
8. Jangan menggunakan `as` hanya untuk menyembunyikan kesalahan tipe.
9. Validasi data eksternal di runtime; tipe TypeScript saja tidak menjamin data API valid.
10. Hindari tipe generik yang terlalu kompleks apabila tipe sederhana lebih mudah dipahami.

Contoh:

```ts
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const getUserDisplayName = (user: UserProfile) => {
  return user.name.trim();
};
```

---

## 9. Standar API dan Backend

Seluruh endpoint backend harus mengikuti konvensi project.

Ketentuan:

1. Pisahkan validasi input, logika bisnis, dan operasi database sesuai kompleksitas kebutuhan.
2. Gunakan metode HTTP sesuai tujuan operasi.
3. Validasi setiap payload di server.
4. Gunakan status HTTP yang tepat.
5. Tangani error secara konsisten.
6. Jangan mengembalikan stack trace atau informasi internal ke client.
7. Jangan mengekspos kredensial, token, secret, atau detail koneksi database.
8. Jangan mempercayai nilai dari client untuk otorisasi.
9. Terapkan autentikasi dan otorisasi sesuai mekanisme project yang sudah tersedia.
10. Gunakan allowlist field yang boleh dibuat atau diubah.
11. Hindari duplikasi implementasi validasi dan penanganan error.
12. Jangan mengubah kontrak API yang sudah digunakan tanpa kebutuhan dan pemeriksaan dampak.
13. Jangan membuat endpoint tambahan yang tidak diminta.
14. Jangan mengembalikan field sensitif dalam respons.

### Database

- Gunakan ORM dan schema yang sudah digunakan project.
- Jangan membuat model atau tabel baru tanpa kebutuhan yang jelas.
- Jangan mengubah schema database di luar ruang lingkup task.
- Periksa relasi, constraint, dan aturan nullability sebelum mengubah data.
- Jangan menjalankan migrasi destruktif tanpa persetujuan eksplisit.
- Jangan menghapus atau mengubah data produksi untuk keperluan pengujian.

---

## 10. Standar Error Handling

Error handling harus jelas dan konsisten.

Ketentuan:

1. Jangan mengabaikan error secara diam-diam.
2. Jangan menggunakan `catch` kosong.
3. Jangan menampilkan pesan teknis internal secara langsung kepada pengguna.
4. Berikan pesan yang dapat dipahami pengguna untuk kegagalan yang memang perlu ditampilkan.
5. Catat informasi teknis melalui mekanisme logging yang tersedia dan sesuai keamanan.
6. Jangan menduplikasi penanganan error yang sama pada banyak lapisan tanpa alasan.
7. Pastikan loading atau state sementara dipulihkan setelah request berhasil maupun gagal.

Contoh:

```ts
const handleSubmit = async () => {
  isLoading.value = true;

  try {
    await submitForm();
  } catch (error) {
    showError(error);
  } finally {
    isLoading.value = false;
  }
};
```

Contoh tersebut merupakan pola konseptual. Gunakan mekanisme notifikasi, request, dan error handling yang benar-benar tersedia di project.

---

## 11. Standar Import dan Dependency

Ketentuan:

1. Gunakan barrel export `index.ts` sesuai aturan pada Bagian 3.
2. Kelompokkan import secara konsisten.
3. Hindari import yang tidak digunakan.
4. Hindari circular dependency.
5. Jangan membuat alias path baru jika alias yang tersedia sudah cukup.
6. Gunakan auto-import Nuxt sesuai konvensi project.
7. Jangan mengimpor modul yang sudah disediakan melalui auto-import apabila tidak diperlukan.
8. Jangan menambahkan dependency baru tanpa kebutuhan yang jelas.
9. Sebelum memasang library, periksa apakah fitur tersebut sudah tersedia di dependency yang ada.
10. Jangan mengubah versi dependency atau lockfile secara tidak berkaitan dengan task.

Contoh pengelompokan import apabila sesuai dengan konfigurasi lint project:

```ts
import { computed, ref } from "vue";

import { FormInput, FormSelect } from "~/components/form";
import { formatCurrency } from "~/utils";

import type { UserProfile } from "~/types";
```

Ikuti konfigurasi ESLint atau formatter yang sudah digunakan apabila aturan pengurutan import berbeda.

---

## 12. Standar Komentar dan Dokumentasi

Kode harus dapat dipahami tanpa harus membaca komentar pada setiap baris.

Ketentuan:

1. Gunakan nama variabel dan fungsi yang menjelaskan maksudnya.
2. Tambahkan komentar untuk menjelaskan alasan atau keputusan yang tidak jelas dari kode.
3. Jangan menambahkan komentar yang hanya mengulang kode.
4. Dokumentasikan fungsi publik yang kompleks jika diperlukan.
5. Dokumentasikan kontrak API dan format data yang tidak jelas.
6. Hapus komentar yang sudah tidak relevan setelah mengubah implementasi.
7. Hindari komentar yang menyebutkan sesuatu sebagai sementara apabila tidak ada rencana atau kebutuhan yang jelas.

Contoh komentar yang kurang bermanfaat:

```ts
// Menambah angka satu
count.value += 1;
```

Komentar yang lebih bermanfaat menjelaskan alasan suatu keputusan, misalnya mengapa proses tertentu harus dijalankan sebelum operasi database.

---

## 13. Standar Keterbacaan dan Kompleksitas

Kode harus mudah dibaca, dipindai, dan dipahami.

Ketentuan:

1. Hindari fungsi yang terlalu panjang jika dapat dipecah dengan jelas.
2. Hindari conditional bertingkat terlalu dalam.
3. Gunakan early return apabila membuat alur lebih jelas.
4. Hindari magic number dan string yang berulang.
5. Hindari duplikasi logika.
6. Hindari satu file yang mencampur terlalu banyak tanggung jawab.
7. Hindari abstraksi berlebihan.
8. Hindari membuat wrapper, helper, composable, atau service yang tidak memberikan manfaat nyata.
9. Gunakan format kode yang konsisten.
10. Jangan mengorbankan kejelasan demi kode yang terlalu singkat.
11. Hindari optimasi prematur.
12. Utamakan alur data yang mudah ditelusuri.

Jika sebuah abstraksi membuat developer harus membuka terlalu banyak file hanya untuk memahami operasi sederhana, evaluasi kembali desainnya.

---

## 14. Standar Scope dan Pencegahan Perubahan di Luar Task

AI WAJIB bekerja sesuai permintaan yang diberikan.

Ketentuan:

1. Jangan menambahkan fitur yang tidak diminta.
2. Jangan melakukan refactor pada file yang tidak berkaitan dengan task.
3. Jangan mengubah struktur project secara menyeluruh tanpa persetujuan.
4. Jangan menghapus implementasi yang sudah berfungsi hanya demi preferensi gaya.
5. Jangan mengubah desain UI di luar kebutuhan yang diminta.
6. Jangan membuat halaman tambahan, endpoint tambahan, atau model database baru tanpa alasan yang relevan.
7. Jangan memperbaiki masalah yang tidak berkaitan jika perbaikannya berisiko memperluas scope.
8. Jika menemukan masalah lain, laporkan sebagai temuan terpisah.
9. Jika suatu perubahan memiliki dampak luas, jelaskan dampaknya sebelum menerapkannya.
10. Pertahankan backward compatibility apabila memungkinkan.

**Aturan wajib:** jika task hanya meminta perubahan pada satu bagian, jangan mengubah bagian lain kecuali perubahan tersebut benar-benar diperlukan agar implementasi dapat bekerja.

---

## 15. Standar Keamanan

1. Jangan menaruh secret atau kredensial dalam source code.
2. Jangan mengekspos environment variable server ke client.
3. Jangan menonaktifkan autentikasi atau otorisasi untuk mempermudah implementasi.
4. Jangan menganggap input client sebagai data tepercaya.
5. Validasi dan sanitasi input sesuai konteks penggunaan.
6. Terapkan kontrol akses di server.
7. Hindari pencatatan token, password, dan informasi sensitif dalam log.
8. Gunakan query parameterized atau ORM untuk mengurangi risiko SQL injection.
9. Perhatikan risiko XSS ketika menampilkan konten yang berasal dari pengguna.
10. Jangan menambahkan akses administratif tanpa pemeriksaan izin.
11. Jangan melakukan perubahan keamanan yang melemahkan sistem yang sudah ada.
12. Jangan mengklaim bahwa implementasi aman tanpa memeriksa jalur akses yang relevan.

---

## 16. Standar Pengujian dan Verifikasi

Setelah menyelesaikan perubahan:

1. Jalankan pemeriksaan yang tersedia dan relevan dengan task.
2. Jalankan typecheck jika project mendukungnya.
3. Jalankan lint jika project mendukungnya.
4. Jalankan test terkait apabila tersedia.
5. Jalankan build jika sesuai dengan skala perubahan dan lingkungan yang tersedia.
6. Periksa kembali seluruh import dan ekspor.
7. Pastikan tidak ada file atau dependency yang tidak diperlukan.
8. Pastikan endpoint dan komponen sesuai dengan kontrak yang telah ditentukan.
9. Periksa perubahan agar tidak ada modifikasi yang tidak terkait.
10. Jangan mengklaim pengujian berhasil apabila belum benar-benar dijalankan.

Jika pengujian gagal karena masalah yang sudah ada sebelumnya, bedakan antara masalah yang diperkenalkan oleh perubahan dan masalah yang telah ada.

Jangan memperbaiki seluruh kegagalan project yang tidak berkaitan secara otomatis. Laporkan temuan tersebut secara terpisah.

---

## 17. Alur Kerja Wajib AI

Ikuti alur kerja berikut untuk setiap task:

### Tahap 1: Understand

- Pahami permintaan.
- Identifikasi ruang lingkup.
- Periksa file dan implementasi terkait.
- Identifikasi dependensi dan batasan.

### Tahap 2: Plan

- Tentukan file yang perlu dibuat atau diubah.
- Gunakan kembali komponen dan utilitas yang tersedia.
- Tentukan perubahan minimum yang diperlukan.
- Identifikasi risiko dan kebutuhan klarifikasi.

### Tahap 3: Implement

- Ikuti standar penamaan dan struktur project.
- Gunakan arrow function sesuai ketentuan.
- Gunakan barrel export `index.ts`.
- Pisahkan tanggung jawab dengan tepat.
- Jangan menambahkan fitur di luar scope.

### Tahap 4: Verify

- Periksa hasil implementasi.
- Jalankan pemeriksaan yang relevan.
- Periksa perubahan file.
- Pastikan tidak ada regresi yang diketahui.

### Tahap 5: Report

Berikan laporan akhir yang menjelaskan:

- Ringkasan perubahan.
- File yang dibuat dan diubah.
- Keputusan implementasi yang penting.
- Hasil pemeriksaan dan pengujian.
- Prasyarat atau masalah yang belum diselesaikan.

---

## 18. Prioritas Ketika Terjadi Konflik Aturan

Jika terdapat konflik, gunakan urutan prioritas berikut:

1. Keamanan dan kebenaran perilaku aplikasi.
2. Permintaan eksplisit pengguna dan batasan task.
3. Arsitektur serta konvensi project yang sudah berjalan.
4. Aturan dalam dokumen ini.
5. Preferensi implementasi pribadi AI.

Jangan mengikuti preferensi pribadi AI jika bertentangan dengan arsitektur project atau permintaan eksplisit pengguna.

Jika aturan ini tidak cocok dengan keterbatasan teknis framework, jelaskan alasan teknisnya dan gunakan solusi yang paling sesuai tanpa memperluas ruang lingkup.

---

## 19. Definition of Done

Task hanya dianggap selesai apabila:

- Implementasi memenuhi kebutuhan yang diminta.
- Tidak ada fitur tambahan yang tidak diminta.
- Komponen dan utilitas yang sudah tersedia telah dipertimbangkan untuk digunakan kembali.
- Struktur folder, penamaan, import, dan export mengikuti standar.
- Kode mudah dipahami dan dipelihara.
- Validasi dan error handling sesuai kebutuhan.
- Tidak ada secret yang terekspos.
- Pemeriksaan yang relevan telah dijalankan atau keterbatasannya dijelaskan.
- Semua file yang berubah dapat dijelaskan alasannya.
- Laporan akhir disampaikan dengan jujur dan ringkas.

**Standar akhir:** setiap perubahan harus mempunyai alasan yang jelas, ruang lingkup yang terkendali, implementasi yang konsisten, dan hasil yang dapat diverifikasi.
