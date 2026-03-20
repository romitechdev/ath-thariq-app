<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b0ad60cb-bc30-4946-aeff-bb059533acb6

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy env example:
   `cp .env.example .env`
3. Isi nilai env berikut di `.env`:
   - `GEMINI_API_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. Jalankan PostgreSQL via Docker:
   `docker compose up -d db`
5. Generate Prisma client dan sinkronkan schema ke DB:
   `npm run prisma:generate && npm run db:push`
6. Isi data dummy awal (opsional):
   `npm run db:seed`
   Jika ingin reset data lama lalu isi ulang dummy:
   `npm run db:seed:reset`
7. Jalankan API server (terminal 1):
   `npm run dev:server`
8. Jalankan frontend Vite (terminal 2):
   `npm run dev`

## Endpoint penting

- Health check database: `GET /api/health/db`
- Admin login: `POST /api/admin/login`
- Kategori: `GET /api/kategori`, `POST /api/kategori`, `PUT /api/kategori/:id`, `DELETE /api/kategori/:id`
- Amalan: `GET /api/amalan`, `GET /api/amalan/:id`, `POST /api/amalan`, `PUT /api/amalan/:id`, `DELETE /api/amalan/:id`

Admin login sekarang divalidasi di backend menggunakan `ADMIN_USERNAME` dan `ADMIN_PASSWORD` dari env (bukan hardcoded di frontend).
