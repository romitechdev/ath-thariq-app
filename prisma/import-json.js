import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shouldReset = process.argv.includes('--reset');
const jsonArg = process.argv.find((arg) => arg.endsWith('.json')) || 'prisma/data-input.json';
const filePath = path.isAbsolute(jsonArg) ? jsonArg : path.resolve(process.cwd(), jsonArg);

const readJsonFile = () => {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `File JSON tidak ditemukan di ${filePath}. Salin prisma/data-template.json menjadi prisma/data-input.json lalu isi datanya.`,
    );
  }

  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Format JSON tidak valid di ${filePath}`);
  }
};

const extractAmalanList = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.amalan)) {
    return payload.amalan;
  }

  if (payload && typeof payload === 'object') {
    const requiredKeys = ['judul', 'kategori_nama', 'isi_arab', 'isi_latin', 'arti', 'jumlah', 'waktu', 'catatan', 'link_sumber'];
    const isSingleItem = requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(payload, key));

    if (isSingleItem) {
      return [payload];
    }
  }

  throw new Error('Format JSON tidak valid. Gunakan object tunggal amalan, array amalan, atau object dengan key amalan (array).');
};

const requiredText = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Field ${fieldName} wajib diisi`);
  }

  return value.trim();
};

const optionalText = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : '';
};

const normalizeLinks = (value, fieldName) => {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry, index) => {
        if (typeof entry !== 'string') {
          throw new Error(`Field ${fieldName}[${index}] harus string`);
        }

        return entry.trim();
      })
      .filter((entry) => entry.length > 0);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  throw new Error(`Field ${fieldName} harus array of string`);
};

const findOrCreateCategory = async (nama, cache) => {
  if (cache.has(nama)) {
    return { id: cache.get(nama), created: false };
  }

  const existing = await prisma.category.findFirst({
    where: { nama },
  });

  if (existing) {
    cache.set(nama, existing.id);
    return { id: existing.id, created: false };
  }

  const created = await prisma.category.create({
    data: { nama },
  });

  cache.set(nama, created.id);
  return { id: created.id, created: true };
};

const run = async () => {
  const payload = readJsonFile();
  const amalanList = extractAmalanList(payload);
  const kategoriList = Array.isArray(payload?.kategori) ? payload.kategori : [];

  if (shouldReset) {
    await prisma.$transaction([
      prisma.amalan.deleteMany(),
      prisma.category.deleteMany(),
    ]);
  }

  const categoryMap = new Map();
  let createdKategori = 0;
  let updatedKategori = 0;

  for (const [index, item] of kategoriList.entries()) {
    const nama = requiredText(item?.nama, `kategori[${index}].nama`);
    const icon = optionalText(item?.icon);

    const existing = await prisma.category.findFirst({
      where: { nama },
    });

    if (existing) {
      if (icon) {
        await prisma.category.update({
          where: { id: existing.id },
          data: { icon },
        });
        updatedKategori += 1;
      }

      categoryMap.set(nama, existing.id);
      continue;
    }

    const created = await prisma.category.create({
      data: icon ? { nama, icon } : { nama },
    });

    categoryMap.set(nama, created.id);
    createdKategori += 1;
  }

  let createdAmalan = 0;
  let updatedAmalan = 0;

  for (const [index, item] of amalanList.entries()) {
    const judul = requiredText(item?.judul, `amalan[${index}].judul`);
    const kategoriNama = requiredText(item?.kategori_nama, `amalan[${index}].kategori_nama`);
    const isiArab = requiredText(item?.isi_arab, `amalan[${index}].isi_arab`);
    const isiLatin = requiredText(item?.isi_latin, `amalan[${index}].isi_latin`);
    const arti = requiredText(item?.arti, `amalan[${index}].arti`);
    const jumlah = optionalText(item?.jumlah);
    const waktu = optionalText(item?.waktu);
    const catatan = optionalText(item?.catatan);
    const linkSumber = normalizeLinks(item?.link_sumber, `amalan[${index}].link_sumber`);

    const { id: kategoriId, created: categoryCreated } = await findOrCreateCategory(kategoriNama, categoryMap);
    if (categoryCreated) {
      createdKategori += 1;
    }

    const existing = await prisma.amalan.findFirst({
      where: {
        judul,
        kategori_id: kategoriId,
      },
    });

    if (existing) {
      await prisma.amalan.update({
        where: { id: existing.id },
        data: {
          judul,
          kategori_id: kategoriId,
          isi_arab: isiArab,
          isi_latin: isiLatin,
          arti,
          jumlah,
          waktu,
          catatan,
          link_sumber: linkSumber,
        },
      });
      updatedAmalan += 1;
      continue;
    }

    await prisma.amalan.create({
      data: {
        judul,
        kategori_id: kategoriId,
        isi_arab: isiArab,
        isi_latin: isiLatin,
        arti,
        jumlah,
        waktu,
        catatan,
        link_sumber: linkSumber,
      },
    });
    createdAmalan += 1;
  }

  const totalKategori = await prisma.category.count();
  const totalAmalan = await prisma.amalan.count();

  console.log('Import JSON selesai');
  console.log(`- Mode reset: ${shouldReset ? 'ya' : 'tidak'}`);
  console.log(`- Kategori dibuat: ${createdKategori}, diupdate: ${updatedKategori}`);
  console.log(`- Amalan dibuat: ${createdAmalan}, diupdate: ${updatedAmalan}`);
  console.log(`- Total akhir => kategori: ${totalKategori}, amalan: ${totalAmalan}`);
};

run()
  .catch((error) => {
    console.error('Import JSON gagal:', error.message || error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
