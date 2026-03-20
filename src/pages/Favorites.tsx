import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@wearesyntesa/karbit-ui/react';
import { Heart, BookOpen, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_AMALAN } from '../data/mockAmalan';
import type { AmalanItem } from '../types/amalan';
import { getSourceHref, normalizeSourceLinks } from '../utils/sourceLink';
import { firstWords } from '../utils/textPreview';
import { createApiUrl } from '../utils/api';

const ITEMS_PER_PAGE = 9;

export default function Favorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [amalanList, setAmalanList] = useState<AmalanItem[]>(MOCK_AMALAN);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAmalan = async () => {
      try {
        const response = await fetch(createApiUrl('/api/amalan'));
        if (!response.ok) return;

        const data = (await response.json()) as AmalanItem[];
        if (isMounted && Array.isArray(data)) {
          setAmalanList(data);
        }
      } catch {
        // Use mock data fallback
      }
    };

    loadAmalan();

    return () => {
      isMounted = false;
    };
  }, []);

  const favoriteItems = amalanList.filter(item => favorites.includes(item.id));
  const totalPages = Math.max(1, Math.ceil(favoriteItems.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFavoriteItems = favoriteItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [favorites.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visiblePages = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage]);

    if (currentPage > 1) {
      pages.add(currentPage - 1);
    }

    if (currentPage < totalPages) {
      pages.add(currentPage + 1);
    }

    return Array.from(pages).sort((a, b) => a - b);
  })();

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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {paginatedFavoriteItems.map((item) => {
            const sourceItems = normalizeSourceLinks(item.link_sumber);
            const firstSource = sourceItems[0] || '';
            const sourceHref = getSourceHref(firstSource);
            const artiPreview = firstWords(item.arti, 10);
            const catatanPreview = firstWords(item.catatan, 10);

            return (
              <Card key={item.id} className="p-6 h-full flex flex-col border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="subtle" className="bg-emerald-100 text-emerald-700 border-none">
                    {item.kategori_nama}
                  </Badge>
                  <button
                    onClick={() => removeFavorite(item.id)}
                    className="p-2 rounded-full hover:bg-rose-50 text-rose-500 transition-colors"
                  >
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </button>
                </div>

                <h3 className="text-xl font-semibold mb-2 line-clamp-2 min-h-14">{item.judul}</h3>
                <p className="text-sm text-muted-foreground mb-2 italic line-clamp-1 min-h-5">"{artiPreview}"</p>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-1 min-h-5">
                  Jumlah: {item.jumlah || '-'} • Waktu: {item.waktu || '-'}
                </p>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-1 min-h-5">Catatan: {catatanPreview}</p>

                <div className="text-xs text-muted-foreground mb-6 min-h-5">
                  {firstSource ? (
                    sourceHref ? (
                      <a
                        href={sourceHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-emerald-700 hover:text-emerald-600 underline underline-offset-2 line-clamp-1"
                      >
                        Sumber: {firstWords(firstSource, 10)}
                      </a>
                    ) : (
                      <p className="line-clamp-1">Sumber: {firstWords(firstSource, 10)}</p>
                    )
                  ) : (
                    <p className="line-clamp-1">Sumber: -</p>
                  )}
                </div>

                <Link to={`/amalan/${item.id}`} className="w-full mt-auto">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl">
                    <BookOpen className="w-4 h-4" />
                    Baca Selengkapnya
                  </Button>
                </Link>
              </Card>
            );
          })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>

              {visiblePages.map((page, index) => (
                <React.Fragment key={page}>
                  {index > 0 && page - visiblePages[index - 1] > 1 && (
                    <span className="px-1 text-sm text-muted-foreground">...</span>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700'
                        : ''
                    }
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </Button>
            </div>
          )}
        </>
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
