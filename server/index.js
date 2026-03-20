import 'dotenv/config';
import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const port = Number(process.env.API_PORT || 3001);

app.use(express.json());

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

const normalizeOptionalText = (value) => {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
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

  if (!nama || !icon) {
    res.status(400).json({ message: 'Nama dan icon kategori wajib diisi' });
    return;
  }

  try {
    const created = await prisma.category.create({
      data: { nama, icon },
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

  if (!nama || !icon) {
    res.status(400).json({ message: 'Nama dan icon kategori wajib diisi' });
    return;
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: { nama, icon },
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

    res.json(
      amalan.map((item) => ({
        id: item.id,
        judul: item.judul,
        kategori_id: item.kategori_id,
        kategori: item.kategori.nama,
        isi_arab: item.isi_arab,
        isi_latin: item.isi_latin,
        arti: item.arti,
        sumber: item.link_sumber,
        link_sumber: item.link_sumber,
      })),
    );
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data amalan',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/amalan', async (req, res) => {
  const judul = normalizeText(req.body?.judul);
  const kategoriId = parseNumericId(req.body?.kategori_id);
  const isiArab = normalizeText(req.body?.isi_arab);
  const isiLatin = normalizeText(req.body?.isi_latin);
  const arti = normalizeText(req.body?.arti);
  const linkSumber = normalizeOptionalText(req.body?.link_sumber);

  if (!judul || !kategoriId || !isiArab || !isiLatin || !arti) {
    res.status(400).json({ message: 'Field wajib amalan belum lengkap' });
    return;
  }

  try {
    const kategori = await prisma.category.findUnique({
      where: { id: kategoriId },
    });

    if (!kategori) {
      res.status(400).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    const created = await prisma.amalan.create({
      data: {
        judul,
        kategori_id: kategoriId,
        isi_arab: isiArab,
        isi_latin: isiLatin,
        arti,
        link_sumber: linkSumber,
      },
      include: { kategori: true },
    });

    res.status(201).json({
      id: created.id,
      judul: created.judul,
      kategori_id: created.kategori_id,
      kategori: created.kategori.nama,
      isi_arab: created.isi_arab,
      isi_latin: created.isi_latin,
      arti: created.arti,
      sumber: created.link_sumber,
      link_sumber: created.link_sumber,
    });
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

    res.json({
      id: item.id,
      judul: item.judul,
      kategori_id: item.kategori_id,
      kategori: item.kategori.nama,
      isi_arab: item.isi_arab,
      isi_latin: item.isi_latin,
      arti: item.arti,
      link_sumber: item.link_sumber,
      sumber: item.link_sumber,
    });
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
  const kategoriId = parseNumericId(req.body?.kategori_id);
  const isiArab = normalizeText(req.body?.isi_arab);
  const isiLatin = normalizeText(req.body?.isi_latin);
  const arti = normalizeText(req.body?.arti);
  const linkSumber = normalizeOptionalText(req.body?.link_sumber);

  if (!judul || !kategoriId || !isiArab || !isiLatin || !arti) {
    res.status(400).json({ message: 'Field wajib amalan belum lengkap' });
    return;
  }

  try {
    const kategori = await prisma.category.findUnique({
      where: { id: kategoriId },
    });

    if (!kategori) {
      res.status(400).json({ message: 'Kategori tidak ditemukan' });
      return;
    }

    const updated = await prisma.amalan.update({
      where: { id },
      data: {
        judul,
        kategori_id: kategoriId,
        isi_arab: isiArab,
        isi_latin: isiLatin,
        arti,
        link_sumber: linkSumber,
      },
      include: { kategori: true },
    });

    res.json({
      id: updated.id,
      judul: updated.judul,
      kategori_id: updated.kategori_id,
      kategori: updated.kategori.nama,
      isi_arab: updated.isi_arab,
      isi_latin: updated.isi_latin,
      arti: updated.arti,
      sumber: updated.link_sumber,
      link_sumber: updated.link_sumber,
    });
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