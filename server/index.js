import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const port = Number(process.env.API_PORT || 3001);
const normalizeOrigin = (value) => String(value || '').trim().replace(/\/+$/, '');
const corsOriginRules = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);
const allowAllOrigins = corsOriginRules.includes('*');

const matchOriginRule = (origin, rule) => {
  if (rule === '*') {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  if (!rule.includes('*')) {
    return normalizedOrigin === rule;
  }

  const escapedRule = rule.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escapedRule}$`).test(normalizedOrigin);
};

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowAllOrigins) {
    return true;
  }

  return corsOriginRules.some((rule) => matchOriginRule(origin, rule));
};

app.use(express.json());
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS`));
    },
  }),
);

const parseNumericId = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const normalizeText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeText(entry))
      .filter((entry) => entry.length > 0);
  }

  const singleValue = normalizeText(value);
  return singleValue ? [singleValue] : [];
};

const mapAmalanResponse = (item) => ({
  id: item.id,
  judul: item.judul,
  kategori_nama: item.kategori.nama,
  isi_arab: item.isi_arab,
  isi_latin: item.isi_latin,
  arti: item.arti,
  jumlah: item.jumlah,
  waktu: item.waktu,
  catatan: item.catatan,
  link_sumber: Array.isArray(item.link_sumber) ? item.link_sumber : [],
});

const findOrCreateCategoryByName = async (rawName) => {
  const nama = normalizeText(rawName);
  if (!nama) {
    return null;
  }

  const existing = await prisma.category.findFirst({
    where: { nama },
  });

  if (existing) {
    return existing;
  }

  return prisma.category.create({
    data: { nama },
  });
};

const resolveCategoryFromPayload = async (payload) => {
  const kategoriNama = normalizeText(payload?.kategori_nama);
  if (kategoriNama) {
    return findOrCreateCategoryByName(kategoriNama);
  }

  const kategoriId = parseNumericId(payload?.kategori_id);
  if (!kategoriId) {
    return null;
  }

  return prisma.category.findUnique({
    where: { id: kategoriId },
  });
};

app.get('/api/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, message: 'Database connected' });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/kategori', async (_req, res) => {
  try {
    const kategori = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });

    res.json(kategori);
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data kategori',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/kategori', async (req, res) => {
  const nama = normalizeText(req.body?.nama);
  const icon = normalizeText(req.body?.icon);

  if (!nama) {
    res.status(400).json({ message: 'Nama kategori wajib diisi' });
    return;
  }

  try {
    const data = icon ? { nama, icon } : { nama };

    const created = await prisma.category.create({
      data,
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menambah kategori',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/kategori/:id', async (req, res) => {
  const id = parseNumericId(req.params.id);
  if (!id) {
    res.status(400).json({ message: 'ID kategori tidak valid' });
    return;
  }

  const nama = normalizeText(req.body?.nama);
  const icon = normalizeText(req.body?.icon);

  if (!nama) {
    res.status(400).json({ message: 'Nama kategori wajib diisi' });
    return;
  }

  try {
    const data = icon ? { nama, icon } : { nama };

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    if (error?.code === 'P2025') {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    res.status(500).json({
      message: 'Gagal mengubah kategori',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.delete('/api/kategori/:id', async (req, res) => {
  const id = parseNumericId(req.params.id);
  if (!id) {
    res.status(400).json({ message: 'ID kategori tidak valid' });
    return;
  }

  try {
    const totalAmalan = await prisma.amalan.count({
      where: { kategori_id: id },
    });

    if (totalAmalan > 0) {
      res.status(409).json({
        message: 'Kategori tidak bisa dihapus karena masih dipakai oleh amalan',
      });
      return;
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    if (error?.code === 'P2025') {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    res.status(500).json({
      message: 'Gagal menghapus kategori',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/amalan', async (_req, res) => {
  try {
    const amalan = await prisma.amalan.findMany({
      include: { kategori: true },
      orderBy: { id: 'asc' },
    });

    res.json(amalan.map(mapAmalanResponse));
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data amalan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/amalan', async (req, res) => {
  const judul = normalizeText(req.body?.judul);
  const isiArab = normalizeText(req.body?.isi_arab);
  const isiLatin = normalizeText(req.body?.isi_latin);
  const arti = normalizeText(req.body?.arti);
  const jumlah = normalizeText(req.body?.jumlah);
  const waktu = normalizeText(req.body?.waktu);
  const catatan = normalizeText(req.body?.catatan);
  const linkSumber = normalizeStringArray(req.body?.link_sumber);

  if (!judul || !isiArab || !isiLatin || !arti) {
    res.status(400).json({ message: 'Field wajib amalan belum lengkap' });
    return;
  }

  try {
    const kategori = await resolveCategoryFromPayload(req.body);

    if (!kategori) {
      res.status(400).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    const created = await prisma.amalan.create({
      data: {
        judul,
        kategori_id: kategori.id,
        isi_arab: isiArab,
        isi_latin: isiLatin,
        arti,
        jumlah,
        waktu,
        catatan,
        link_sumber: linkSumber,
      },
      include: { kategori: true },
    });

    res.status(201).json(mapAmalanResponse(created));
  } catch (error) {
    res.status(500).json({
      message: 'Gagal menambah amalan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/amalan/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ message: 'ID amalan tidak valid' });
    return;
  }

  try {
    const item = await prisma.amalan.findUnique({
      where: { id },
      include: { kategori: true },
    });

    if (!item) {
      res.status(404).json({ message: 'Amalan tidak ditemukan' });
      return;
    }

    res.json(mapAmalanResponse(item));
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil detail amalan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.put('/api/amalan/:id', async (req, res) => {
  const id = parseNumericId(req.params.id);
  if (!id) {
    res.status(400).json({ message: 'ID amalan tidak valid' });
    return;
  }

  const judul = normalizeText(req.body?.judul);
  const isiArab = normalizeText(req.body?.isi_arab);
  const isiLatin = normalizeText(req.body?.isi_latin);
  const arti = normalizeText(req.body?.arti);
  const jumlah = normalizeText(req.body?.jumlah);
  const waktu = normalizeText(req.body?.waktu);
  const catatan = normalizeText(req.body?.catatan);
  const linkSumber = normalizeStringArray(req.body?.link_sumber);

  if (!judul || !isiArab || !isiLatin || !arti) {
    res.status(400).json({ message: 'Field wajib amalan belum lengkap' });
    return;
  }

  try {
    const kategori = await resolveCategoryFromPayload(req.body);

    if (!kategori) {
      res.status(400).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    const updated = await prisma.amalan.update({
      where: { id },
      data: {
        judul,
        kategori_id: kategori.id,
        isi_arab: isiArab,
        isi_latin: isiLatin,
        arti,
        jumlah,
        waktu,
        catatan,
        link_sumber: linkSumber,
      },
      include: { kategori: true },
    });

    res.json(mapAmalanResponse(updated));
  } catch (error) {
    if (error?.code === 'P2025') {
      res.status(404).json({ message: 'Amalan tidak ditemukan' });
      return;
    }

    res.status(500).json({
      message: 'Gagal mengubah amalan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.delete('/api/amalan/:id', async (req, res) => {
  const id = parseNumericId(req.params.id);
  if (!id) {
    res.status(400).json({ message: 'ID amalan tidak valid' });
    return;
  }

  try {
    await prisma.amalan.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    if (error?.code === 'P2025') {
      res.status(404).json({ message: 'Amalan tidak ditemukan' });
      return;
    }

    res.status(500).json({
      message: 'Gagal menghapus amalan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, email, password } = req.body || {};
  const inputUsername = username || email;

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    res.status(500).json({ message: 'ADMIN_USERNAME atau ADMIN_PASSWORD belum diset di env' });
    return;
  }

  if (inputUsername === adminUsername && password === adminPassword) {
    res.json({ success: true });
    return;
  }

  res.status(401).json({ success: false, message: 'Username atau password salah' });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);