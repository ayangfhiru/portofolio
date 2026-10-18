# Portfolio (Nuxt 4 + Tailwind CSS + Prisma ORM)

Portofolio digital interaktif yang dikonversi dari file HTML murni (`docs/code.html`) menjadi aplikasi modern berbasis **Nuxt 4**, **Vue 3 Composition API**, **Tailwind CSS**, dan **Prisma ORM** dengan PostgreSQL.

Seluruh isi halaman (profil, statistik, layanan, tech stack, project, pengalaman, testimonial, kontak) bersifat **dinamis** dan diambil dari database lewat endpoint API.

---

## 🛠️ Tech Stack

- **Nuxt.js 4** & **Vue 3** (Script Setup + TypeScript)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Prisma ORM 7** (PostgreSQL driver adapter `@prisma/adapter-pg`)
- **Nitro Server Engine** (API Endpoints di `server/api/`)

---

## 🚀 Memulai Proyek

### 1. Prasyarat
- Node.js >= 18.x
- pnpm / npm / yarn
- PostgreSQL (opsional untuk pratinjau lokal — lihat bagian *Data fallback*)

### 2. Instalasi Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env` lalu isi nilainya:
```bash
cp .env.example .env
```

Setiap variabel sudah diberi komentar penjelasan di `.env.example`. Ringkasannya:

| Variabel | Kegunaan |
| --- | --- |
| `DATABASE_URL` | Koneksi PostgreSQL yang dipakai Prisma |
| `NUXT_PUBLIC_APP_URL` | URL publik aplikasi (untuk link absolut) |
| `ENABLE_FALLBACK_DATA` | `true` → API menyediakan data contoh bila DB gagal diakses. Set `false` di production agar kegagalan DB terlihat jelas |
| `UPLOAD_MAX_IMAGE_MB` | Batas ukuran gambar untuk `POST /api/projects` |
| `UPLOAD_MAX_FILE_MB` | Batas ukuran file untuk `POST /api/admin/upload` (jenis file apa pun). Bila kosong, memakai `UPLOAD_MAX_IMAGE_MB` |

### 4. Database & Seed
Generate client Prisma lalu buat tabel:
```bash
pnpm db:generate
pnpm db:push        # atau: pnpm db:migrate
```

Isi data awal (idempotent — aman dijalankan berulang):
```bash
pnpm db:seed
```

### 5. Menjalankan Server Development
```bash
pnpm dev
```
Buka browser di `http://localhost:3000`.

### 6. Build untuk Produksi
```bash
pnpm build
pnpm preview
```

---

## 💾 Data Fallback

Ketika database belum terhubung (mis. belum di-seed atau `DATABASE_URL` salah), endpoint GET tetap merespons `200` dengan **data contoh** dan `success: false`, sehingga halaman tetap bisa dipratinjau. Pesan peringatan akan tampil pada bagian *Work*.

Sumber kebenaran yang sesungguhnya adalah `prisma/seed.ts`. Setelah database terisi, set `ENABLE_FALLBACK_DATA=false` agar kegagalan query terlihat sebagai error, bukan ditutupi diam-diam.

---

## 📡 API Endpoints

### Konten (GET)
| Endpoint | Isi |
| --- | --- |
| `GET /api/profile` | Identitas, teks hero/about, badge, kontak (singleton) |
| `GET /api/stats` | Statistik hero (counter angka) |
| `GET /api/services` | Daftar layanan |
| `GET /api/stack` | Grup tech stack beserta itemnya |
| `GET /api/experience` | Timeline karier + poin pendukung |
| `GET /api/testimonial` | Testimonial yang sedang aktif |
| `GET /api/contact` | Kartu info kontak + tautan sosial media |
| `GET /api/facts` | Fakta singkat pada bagian About |

### Project
| Endpoint | Isi |
| --- | --- |
| `GET /api/projects` | Daftar project (query opsional `?category=web\|mobile\|oss`), termasuk tag & status featured |
| `POST /api/projects` | Membuat project baru. Menerima `application/json` (dengan `imageUrl`) **atau** `multipart/form-data` (dengan file `image`) |
| `GET /api/project-tags` | Daftar tag project |
| `POST /api/project-tags` | Menambah tag baru. Body: `{ name, projectId }` |

#### Contoh membuat project dengan upload gambar

Menggunakan util `postProject` (`app/utils/post-project.ts`):

```ts
import { postProject } from "~/utils/post-project";

const file = document.querySelector<HTMLInputElement>("#image")?.files?.[0];

await postProject(
  {
    slug: "my-project",
    title: "My Project",
    description: "Deskripsi singkat.",
    category: "web",
    year: 2026,
    imageUrl: "", // diabaikan bila file dikirim
    featured: true,
    tags: ["Next.js", "TypeScript"],
  },
  file, // opsional — bila diisi, request dikirim sebagai multipart
);
```

Gambar yang di-upload disimpan di `public/uploads/projects/` dan dapat diakses langsung sebagai URL statis.

---

## ✍️ Penekanan Teks pada Konten

Konten dinamis (paragraf hero/about, fakta, kartu kontak, quote) mendukung penanda `**penekanan**` untuk menampilkan frasa tebal atau berwarna aksen, tanpa perlu menyimpan HTML mentah di database.

```text
"Jakarta, **Indonesia**"  →  Jakarta, <span class="text-accent">Indonesia</span>
```

Penanda ini diproses oleh `splitEmphasis` di `app/utils/format.ts`, lalu tiap komponen memutuskan styling-nya sendiri (tebal untuk paragraf, warna aksen untuk fakta & kartu kontak, miring-aksen untuk quote).

---

## 📁 Struktur Proyek
```text
.
├── app/
│   ├── components/
│   │   ├── layout/          # AppNavbar, MobileMenu, AppFooter
│   │   ├── sections/        # Hero, About, Services, Stack, Work, Experience, Quote, Contact
│   │   ├── ui/              # AppButton, SectionHeading, ProjectCard, dll.
│   │   └── project-tags/    # Formulir CRUD tag
│   ├── composables/         # useScrollProgress, useJakartaClock
│   ├── pages/               # index.vue (komposer) & admin/project-tags.vue
│   ├── plugins/             # reveal.ts — direktif v-reveal
│   ├── types/               # Tipe data per domain (project, profile, stack, dll.)
│   └── utils/               # format.ts, navigation.ts, post-project.ts
├── prisma/
│   ├── schema.prisma        # Model database (lihat daftar di bawah)
│   └── seed.ts              # Data awal
├── server/
│   ├── api/                 # Endpoint (profile, stats, services, stack, dll.)
│   └── utils/               # prisma.ts, db.ts, response.ts, validation.ts,
│                            # upload.ts, fallback.ts
├── .env.example
├── nuxt.config.ts
└── README.md
```

### Model Database

| Model | Kegunaan |
| --- | --- |
| `Profile` | Identitas + copy hero/about/kontak (singleton, id tetap `singleton`) |
| `Stat` | Statistik hero |
| `Service` | Daftar layanan |
| `StackGroup` / `StackItem` | Grup tech stack + itemnya |
| `Project` / `ProjectTag` | Project portfolio + tag |
| `Experience` / `ExperiencePoint` | Timeline karier + poin |
| `Testimonial` | Quote client (`active` menentukan yang tampil) |
| `AboutFact` | Fakta singkat pada bagian About |
| `ContactCard` | Kartu info kontak |
| `SocialLink` | Tautan sosial media |
