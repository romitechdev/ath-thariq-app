import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, Badge } from '@wearesyntesa/karbit-ui/react';
import { ArrowLeft, Heart, Share2, Bookmark } from 'lucide-react';

// Mock data
const MOCK_AMALAN = [
  {
    id: 1,
    judul: 'Dzikir Pagi',
    kategori: 'Harian',
    isi_arab: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
    isi_latin: 'Subhanallahi wa bihamdihi: adada khalqihi, wa ridha nafsihi, wa zinata arshihi, wa midada kalimatihi',
    arti: 'Maha Suci Allah dan segala puji bagi-Nya, sebanyak bilangan makhluk-Nya, sesuai keridhaan diri-Nya, seberat timbangan Arsy-Nya, dan sebanyak tinta kalimat-kalimat-Nya.',
    sumber: 'HR. Muslim no. 2726'
  }
];

export default function Detail() {
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const item = MOCK_AMALAN.find(a => a.id === Number(id)) || MOCK_AMALAN[0];

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      const favorites = JSON.parse(saved);
      setIsFavorite(favorites.includes(item.id));
    }
  }, [item.id]);

  const toggleFavorite = () => {
    const saved = localStorage.getItem('favorites');
    let favorites = saved ? JSON.parse(saved) : [];
    
    if (isFavorite) {
      favorites = favorites.filter((favId: number) => favId !== item.id);
    } else {
      favorites.push(item.id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <Card className="p-8 border-none shadow-xl bg-card rounded-3xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <Badge className="mb-2 bg-emerald-100 text-emerald-700 border-none">{item.kategori}</Badge>
            <h1 className="text-3xl font-bold">{item.judul}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleFavorite} className="rounded-full">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-12">
          <section className="text-center py-8 bg-emerald-50/30 rounded-2xl">
            <p className="font-arabic text-4xl md:text-5xl leading-relaxed text-slate-800" dir="rtl">
              {item.isi_arab}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-3">Latin</h3>
            <p className="text-lg text-slate-700 leading-relaxed italic">
              {item.isi_latin}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-3">Terjemahan</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              {item.arti}
            </p>
          </section>

          {item.sumber && (
            <footer className="pt-8 border-t border-border mt-8">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Sumber: {item.sumber}
              </p>
            </footer>
          )}
        </div>
      </Card>
    </div>
  );
}
