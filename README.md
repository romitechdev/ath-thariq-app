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
CORS_ORIGIN="http://localhost:5173"

# Opsional (untuk frontend production, mis. Vercel)
# VITE_API_BASE_URL="https://api.domain-anda.com"

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
      "jumlah": "100x",
      "waktu": "Pagi",
      "catatan": "Dibaca setelah Subuh",
      "link_sumber": ["https://..."]
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
- `npm run start:server` → jalankan backend mode production.
- `npm start` → alias ke `npm run start:server`.
- `npm run tunnel:quick` → buka quick tunnel ke frontend lokal (`5173`).
- `npm run dev:quick` → jalankan backend + frontend + quick tunnel sekaligus (1 perintah).
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

### Cara paling cepat (1 perintah)

```bash
npm run dev:quick
```

Script ini akan:
- Menjalankan backend (`3001`)
- Menjalankan frontend (`5173`)
- Membuka quick tunnel ke frontend

### Manual (jika ingin terpisah)

```bash
cloudflared tunnel --config /dev/null --origincert /dev/null --url http://localhost:5173 --http-host-header localhost --no-autoupdate
```

Catatan: URL `trycloudflare.com` berubah setiap restart tunnel.
Jika pakai `npm run dev:quick`, log tunnel disimpan ke `/tmp/quick-tunnel.log`.
Log `ERR Configuration file /dev/null was empty` bisa diabaikan (tunnel tetap berjalan).

## Deploy Frontend Vercel + Backend Server Lab

### 1) Siapkan backend di server lab

```bash
npm ci
npm run prisma:generate
npm run db:push
```

Set `.env` backend (contoh production):

```dotenv
NODE_ENV="production"
API_PORT="3001"

# domain frontend yang diizinkan mengakses API
CORS_ORIGIN="https://nama-project.vercel.app,https://*.vercel.app"

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="ganti-password-aman"
DATABASE_URL="postgresql://user:password@host:5432/jalur_langit?schema=public"
```

Jalankan backend dengan PM2:

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Verifikasi backend:

```bash
curl http://localhost:3001/api/health/db
```

### 2) Publikasikan backend dengan Nginx + HTTPS

Gunakan contoh config di `deploy/nginx-ath-thariq-api.conf.example` lalu aktifkan di Nginx.

Setelah domain API mengarah ke server, pasang SSL:

```bash
sudo certbot --nginx -d api.domain-anda.com
```

### 3) Deploy frontend ke Vercel

- Import repository ke Vercel.
- Build command: `npm run build`.
- Output directory: `dist`.
- Tambahkan env Vercel:

```dotenv
VITE_API_BASE_URL="https://api.domain-anda.com"
```

Routing SPA sudah disiapkan lewat `vercel.json`, jadi refresh di route seperti `/favorit` atau `/admin/dashboard` tidak 404.

Catatan: jika `VITE_API_BASE_URL` dikosongkan, frontend akan fallback ke path relatif `/api` (cocok untuk dev lokal, tidak disarankan untuk deploy split-host).

## Troubleshooting Singkat

- `npm run dev` gagal `Exit 1` → biasanya port `5173` sudah dipakai proses lain.
- `Database connection failed` → cek `DATABASE_URL`, `DB_PORT`, dan status `docker compose ps`.
- Tunnel Cloudflare 404 pada Vite → gunakan opsi `--http-host-header localhost`.

---

Untuk pengembangan internal, fokus utama sudah mencakup alur CRUD admin, import data massal, dan publikasi cepat via tunnel.
