import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@wearesyntesa/karbit-ui/react';
import { Heart, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for demonstration since we don't have a live DB connection in this turn
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

export default function Home() {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-emerald-600 mb-4 tracking-tight">Jalur Langit</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Temukan ketenangan melalui amalan-amalan pilihan yang bersumber dari Al-Qur'an dan As-Sunnah.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari amalan..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-emerald-50">Semua</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-emerald-50">Harian</Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-emerald-50">Perlindungan</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_AMALAN.map((item) => (
          <Card key={item.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="subtle" className="bg-emerald-100 text-emerald-700 border-none">
                  {item.kategori}
                </Badge>
                <button 
                  onClick={() => toggleFavorite(item.id)}
                  className="p-2 rounded-full hover:bg-rose-50 transition-colors group/fav"
                >
                  <Heart 
                    className={`w-5 h-5 transition-all ${favorites.includes(item.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-muted-foreground group-hover/fav:text-rose-400'}`} 
                  />
                </button>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors">
                {item.judul}
              </h3>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 italic">
                "{item.arti}"
              </p>

              <div className="flex items-center justify-between mt-auto">
                <Link to={`/amalan/${item.id}`} className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl">
                    <BookOpen className="w-4 h-4" />
                    Baca Selengkapnya
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
