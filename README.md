# Portfolio (Nuxt 4 + Tailwind CSS + Prisma ORM)

Portofolio digital interaktif yang dikonversi dari file HTML murni (`docs/code.html`) menjadi aplikasi modern berbasis **Nuxt 4**, **Vue 3 Composition API**, **Tailwind CSS**, dan **Prisma ORM** dengan PostgreSQL.

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
- PostgreSQL (opsional untuk seed lokal)

### 2. Instalasi Dependensi
```bash
pnpm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilai `DATABASE_URL` dengan database PostgreSQL Anda.

### 4. Prisma Database & Migrations
Generate client Prisma:
```bash
pnpm db:generate
```

Push schema atau migrate database:
```bash
pnpm db:push
# atau
pnpm db:migrate
```

Seed database:
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

## 📡 API Endpoints

- `GET /api/projects`
  - Mengambil daftar proyek (opsional query `?category=web|mobile|oss`).
  - Termasuk data tag & status featured.
  - Memiliki fallback data otomatis saat database belum terhubung.

---

## 📁 Struktur Proyek
```text
.
├── app/
│   ├── app.vue            # Halaman utama aplikasi & interaksi Vue
│   └── assets/
│       └── main.css       # Style design tokens & styling dari HTML asli
├── docs/
│   ├── PROMT.md           # Panduan spesifikasi konversi
│   └── code.html          # Template HTML sumber portofolio
├── prisma/
│   ├── schema.prisma      # Model database (Project & ProjectTag)
│   └── seed.ts            # Script seeding data awal
├── server/
│   ├── api/
│   │   └── projects/
│   │       └── index.get.ts # Endpoint data proyek
│   └── utils/
│       └── prisma.ts      # Koneksi prisma client singleton server-side
├── .env.example
├── nuxt.config.ts
└── README.md
```
