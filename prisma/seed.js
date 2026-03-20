import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const shouldReset = process.argv.includes('--reset');

const categoriesData = [
  { nama: 'Harian', icon: '📿' },
  { nama: 'Perlindungan', icon: '🛡️' },
  { nama: 'Shalat', icon: '🕌' },
  { nama: 'Doa', icon: '🤲' },
];

const amalanData = [
  {
    judul: 'Dzikir Pagi',
    kategoriNama: 'Harian',
    isi_arab: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    isi_latin: 'Subhanallahi wa bihamdihi',
    arti: 'Maha Suci Allah dan segala puji bagi-Nya.',
    jumlah: '100x',
    waktu: 'Pagi',
    catatan: 'Dibaca setelah shalat Subuh.',
    link_sumber: ['HR. Muslim no. 2691'],
  },
  {
    judul: 'Dzikir Petang',
    kategoriNama: 'Harian',
    isi_arab: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    isi_latin: 'Astaghfirullaha wa atubu ilaih',
    arti: 'Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.',
    jumlah: '100x',
    waktu: 'Petang',
    catatan: 'Dibaca menjelang Maghrib.',
    link_sumber: ['HR. Bukhari no. 6307'],
  },
  {
    judul: 'Ayat Kursi',
    kategoriNama: 'Perlindungan',
    isi_arab: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    isi_latin: 'Allahu la ilaha illa huwal hayyul qayyum',
    arti: 'Allah, tidak ada Tuhan selain Dia, Yang Maha Hidup, Yang terus menerus mengurus makhluk-Nya.',
    jumlah: '1x',
    waktu: 'Setelah shalat fardhu',
    catatan: 'Juga dianjurkan sebelum tidur.',
    link_sumber: ['https://quran.com/2/255'],
  },
  {
    judul: 'Doa Keluar Rumah',
    kategoriNama: 'Perlindungan',
    isi_arab: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ',
    isi_latin: 'Bismillahi tawakkaltu alallah',
    arti: 'Dengan nama Allah, aku bertawakal kepada Allah.',
    jumlah: '1x',
    waktu: 'Saat keluar rumah',
    catatan: 'Dibaca sebelum melangkah keluar.',
    link_sumber: ['HR. Abu Dawud no. 5095'],
  },
  {
    judul: 'Doa Iftitah Ringkas',
    kategoriNama: 'Shalat',
    isi_arab: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ',
    isi_latin: 'Subhanakallahumma wa bihamdik',
    arti: 'Maha Suci Engkau ya Allah, aku memuji-Mu.',
    jumlah: '1x',
    waktu: 'Awal shalat',
    catatan: 'Dibaca setelah takbiratul ihram.',
    link_sumber: ['HR. Abu Dawud no. 775'],
  },
  {
    judul: 'Tasbih Setelah Shalat',
    kategoriNama: 'Shalat',
    isi_arab: 'سُبْحَانَ اللَّهِ',
    isi_latin: 'Subhanallah',
    arti: 'Maha Suci Allah.',
    jumlah: '33x',
    waktu: 'Setelah shalat',
    catatan: 'Lanjutkan tahmid dan takbir masing-masing 33x.',
    link_sumber: ['HR. Muslim no. 597'],
  },
  {
    judul: 'Doa Sebelum Tidur',
    kategoriNama: 'Doa',
    isi_arab: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
    isi_latin: 'Bismika Allahumma ahya wa amut',
    arti: 'Dengan nama-Mu ya Allah aku hidup dan aku mati.',
    jumlah: '1x',
    waktu: 'Sebelum tidur',
    catatan: 'Dibaca dalam keadaan suci bila memungkinkan.',
    link_sumber: ['HR. Bukhari no. 6324'],
  },
  {
    judul: 'Doa Bangun Tidur',
    kategoriNama: 'Doa',
    isi_arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا',
    isi_latin: 'Alhamdulillahil ladzi ahyana',
    arti: 'Segala puji bagi Allah yang telah menghidupkan kami.',
    jumlah: '1x',
    waktu: 'Saat bangun tidur',
    catatan: 'Disyukuri dengan mengingat nikmat kehidupan.',
    link_sumber: ['HR. Bukhari no. 6312'],
  },
];

const run = async () => {
  if (shouldReset) {
    await prisma.$transaction([
      prisma.amalan.deleteMany(),
      prisma.category.deleteMany(),
    ]);
  }

  const categoryMap = new Map();

  for (const item of categoriesData) {
    const existing = await prisma.category.findFirst({
      where: { nama: item.nama },
    });

    if (existing) {
      const updated = await prisma.category.update({
        where: { id: existing.id },
        data: { icon: item.icon },
      });
      categoryMap.set(item.nama, updated.id);
      continue;
    }

    const created = await prisma.category.create({
      data: item,
    });
    categoryMap.set(item.nama, created.id);
  }

  for (const item of amalanData) {
    const kategoriId = categoryMap.get(item.kategoriNama);

    if (!kategoriId) {
      continue;
    }

    const existing = await prisma.amalan.findFirst({
      where: {
        judul: item.judul,
        kategori_id: kategoriId,
      },
    });

    if (existing) {
      await prisma.amalan.update({
        where: { id: existing.id },
        data: {
          judul: item.judul,
          kategori_id: kategoriId,
          isi_arab: item.isi_arab,
          isi_latin: item.isi_latin,
          arti: item.arti,
          jumlah: item.jumlah,
          waktu: item.waktu,
          catatan: item.catatan,
          link_sumber: item.link_sumber,
        },
      });
      continue;
    }

    await prisma.amalan.create({
      data: {
        judul: item.judul,
        kategori_id: kategoriId,
        isi_arab: item.isi_arab,
        isi_latin: item.isi_latin,
        arti: item.arti,
        jumlah: item.jumlah,
        waktu: item.waktu,
        catatan: item.catatan,
        link_sumber: item.link_sumber,
      },
    });
  }

  const totalKategori = await prisma.category.count();
  const totalAmalan = await prisma.amalan.count();
  console.log(
    `${shouldReset ? 'Reset + seed' : 'Seed'} selesai. Kategori: ${totalKategori}, Amalan: ${totalAmalan}`,
  );
};

run()
  .catch((error) => {
    console.error('Seed gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
