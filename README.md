# Jalur Langit

Platform amalan Islami untuk membaca amalan harian, menyimpan favorit, dan mengelola konten melalui panel admin.

## Fitur Utama

- Katalog amalan dengan detail Arab, latin, arti, dan sumber.
- Halaman favorit berbasis `localStorage`.
- Admin login berbasis environment variable (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
- CRUD kategori dan amalan melalui dashboard admin.
- Import data massal via JSON (`db:import`, `db:import:reset`).

## Arsitektur

- **Frontend**: React + Vite (default `http://localhost:5173`).
- **Backend API**: Express + Prisma (default `http://localhost:3001`).
- **Database**: PostgreSQL via Docker Compose.
- **Data access**: Vite proxy `'/api' -> API server`.

## Prasyarat

- Node.js 18+
- npm
- Docker + Docker Compose

## Konfigurasi Environment

Salin file contoh:

```bash
cp .env.example .env
```

Isi `.env` sesuai environment server/lokal. Nilai dev yang umum dipakai:

```dotenv
DB_HOST="localhost"
DB_PORT="55432"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_NAME="jalur_langit"

DATABASE_URL="postgresql://postgres:postgres@localhost:55432/jalur_langit?schema=public"

API_PORT="3001"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="ganti-password-aman"
```

## Menjalankan Project (Local/Lab Server)

1. Install dependency:

```bash
npm install
```

2. Jalankan PostgreSQL:

```bash
docker compose up -d db
```

3. Generate Prisma client dan sinkronkan schema:

```bash
npm run prisma:generate
npm run db:push
```

4. (Opsional) Isi data awal:

```bash
npm run db:seed
```

5. Jalankan backend (terminal 1):

```bash
npm run dev:server
```

6. Jalankan frontend (terminal 2):

```bash
npm run dev
```

## Import Data Massal (JSON)

### 1) Siapkan file input

- Template: `prisma/data-template.json`
- File input aktif: `prisma/data-input.json`

Struktur wajib:

```json
{
  "kategori": [
    {
      "nama": "Harian",
      "icon": "📿"
    }
  ],
  "amalan": [
    {
      "judul": "Dzikir Pagi",
      "kategori_nama": "Harian",
      "isi_arab": "...",
      "isi_latin": "...",
      "arti": "...",
      "link_sumber": "..."
    }
  ]
}
```

### 2) Jalankan import

- Import tanpa hapus data lama:

```bash
npm run db:import
```

- Reset data kategori+amalan lalu import ulang:

```bash
npm run db:import:reset
```

## Script NPM

- `npm run dev` → jalankan frontend Vite di port `5173`.
- `npm run dev:server` → jalankan backend Express API.
- `npm run prisma:generate` → generate Prisma Client.
- `npm run db:push` → sinkron schema Prisma ke database.
- `npm run db:seed` → isi data dummy bawaan.
- `npm run db:seed:reset` → reset + seed dummy bawaan.
- `npm run db:import` → import massal dari `prisma/data-input.json`.
- `npm run db:import:reset` → reset + import massal dari JSON.
- `npm run db:studio` → buka Prisma Studio.
- `npm run lint` → type-check TypeScript.

## Endpoint API

### Health

- `GET /api/health/db`

### Auth

- `POST /api/admin/login`

### Kategori

- `GET /api/kategori`
- `POST /api/kategori`
- `PUT /api/kategori/:id`
- `DELETE /api/kategori/:id`

### Amalan

- `GET /api/amalan`
- `GET /api/amalan/:id`
- `POST /api/amalan`
- `PUT /api/amalan/:id`
- `DELETE /api/amalan/:id`

## Akses Publik via Cloudflare Tunnel (Opsional)

Jika aplikasi dijalankan di server lab dan ingin dibuka publik tanpa deploy:

```bash
cloudflared tunnel --config /dev/null --url http://localhost:5173 --http-host-header localhost --no-autoupdate
```

Catatan: URL `trycloudflare.com` berubah setiap restart tunnel.

## Troubleshooting Singkat

- `npm run dev` gagal `Exit 1` → biasanya port `5173` sudah dipakai proses lain.
- `Database connection failed` → cek `DATABASE_URL`, `DB_PORT`, dan status `docker compose ps`.
- Tunnel Cloudflare 404 pada Vite → gunakan opsi `--http-host-header localhost`.

---

Untuk pengembangan internal, fokus utama sudah mencakup alur CRUD admin, import data massal, dan publikasi cepat via tunnel.
