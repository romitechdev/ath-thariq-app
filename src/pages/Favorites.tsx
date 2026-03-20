import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@wearesyntesa/karbit-ui/react';
import { Heart, BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const MOCK_AMALAN = [
  {
    id: 1,
    judul: 'Dzikir Pagi',
    kategori: 'Harian',
    isi_latin: 'Subhanallahi wa bihamdihi...',
    arti: 'Maha Suci Allah dan segala puji bagi-Nya...',
  },
  {
    id: 2,
    judul: 'Ayat Kursi',
    kategori: 'Perlindungan',
    isi_latin: 'Allahu la ilaha illa huwal hayyul qayyum...',
    arti: 'Allah, tidak ada Tuhan melainkan Dia yang Hidup kekal...',
  },
  {
    id: 3,
    judul: 'Doa Sebelum Tidur',
    kategori: 'Harian',
    isi_latin: 'Bismika Allahumma ahya wa amut...',
    arti: 'Dengan nama-Mu ya Allah aku hidup dan aku mati...',
  },
];

export default function Favorites() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const favoriteItems = MOCK_AMALAN.filter(item => favorites.includes(item.id));

  const removeFavorite = (id: number) => {
    const newFavorites = favorites.filter(favId => favId !== id);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Amalan Favorit</h1>
        <p className="text-muted-foreground">Kumpulan amalan yang telah Anda simpan.</p>
      </header>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map((item) => (
            <Card key={item.id} className="p-6 border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="subtle" className="bg-emerald-100 text-emerald-700 border-none">
                  {item.kategori}
                </Badge>
                <button 
                  onClick={() => removeFavorite(item.id)}
                  className="p-2 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
                >
                  <Heart className="w-5 h-5 fill-rose-500" />
                </button>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{item.judul}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 italic">"{item.arti}"</p>

              <Link to={`/amalan/${item.id}`} className="w-full">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                  Baca Selengkapnya
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Belum ada amalan favorit yang disimpan.</p>
          <Link to="/">
            <Button variant="link" className="text-emerald-600 mt-2">Cari amalan sekarang</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
