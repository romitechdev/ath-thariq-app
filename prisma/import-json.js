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

const requiredText = (value, fieldName) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Field ${fieldName} wajib diisi`);
  }

  return value.trim();
};

const optionalText = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const run = async () => {
  const payload = readJsonFile();

  if (!Array.isArray(payload.kategori)) {
    throw new Error('Field kategori harus berupa array');
  }

  if (!Array.isArray(payload.amalan)) {
    throw new Error('Field amalan harus berupa array');
  }

  if (shouldReset) {
    await prisma.$transaction([
      prisma.amalan.deleteMany(),
      prisma.category.deleteMany(),
    ]);
  }

  const categoryMap = new Map();
  let createdKategori = 0;
  let updatedKategori = 0;

  for (const [index, item] of payload.kategori.entries()) {
    const nama = requiredText(item?.nama, `kategori[${index}].nama`);
    const icon = requiredText(item?.icon, `kategori[${index}].icon`);

    const existing = await prisma.category.findFirst({
      where: { nama },
    });

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon },
      });
      categoryMap.set(nama, existing.id);
      updatedKategori += 1;
      continue;
    }

    const created = await prisma.category.create({
      data: { nama, icon },
    });

    categoryMap.set(nama, created.id);
    createdKategori += 1;
  }

  let createdAmalan = 0;
  let updatedAmalan = 0;

  for (const [index, item] of payload.amalan.entries()) {
    const judul = requiredText(item?.judul, `amalan[${index}].judul`);
    const kategoriNama = requiredText(item?.kategori_nama, `amalan[${index}].kategori_nama`);
    const isiArab = requiredText(item?.isi_arab, `amalan[${index}].isi_arab`);
    const isiLatin = requiredText(item?.isi_latin, `amalan[${index}].isi_latin`);
    const arti = requiredText(item?.arti, `amalan[${index}].arti`);
    const linkSumber = optionalText(item?.link_sumber);

    let kategoriId = categoryMap.get(kategoriNama);

    if (!kategoriId) {
      const existingCategory = await prisma.category.findFirst({
        where: { nama: kategoriNama },
      });

      if (!existingCategory) {
        throw new Error(
          `Kategori '${kategoriNama}' pada amalan[${index}] tidak ditemukan. Pastikan kategori ada di array kategori atau database.`,
        );
      }

      kategoriId = existingCategory.id;
      categoryMap.set(kategoriNama, kategoriId);
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
