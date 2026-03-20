import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@wearesyntesa/karbit-ui/react';
import { Heart, Search, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { MOCK_AMALAN } from '../data/mockAmalan';
import type { AmalanItem } from '../types/amalan';
import { getSourceHref, normalizeSourceLinks } from '../utils/sourceLink';
import { firstWords } from '../utils/textPreview';
import { createApiUrl } from '../utils/api';

const ITEMS_PER_PAGE = 9;

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

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

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const searchQuery = searchParams.get('q') || '';
  const requestedCategory = searchParams.get('kategori') || 'Semua';
  const kategoriList = ['Semua', ...new Set(amalanList.map((item) => item.kategori_nama))];
  const activeCategory = kategoriList.includes(requestedCategory) ? requestedCategory : 'Semua';

  const setFilterParams = (nextQuery: string, nextCategory: string, replace = false) => {
    const params = new URLSearchParams(searchParams);
    const normalizedQuery = nextQuery.trim();

    if (normalizedQuery) {
      params.set('q', normalizedQuery);
    } else {
      params.delete('q');
    }

    if (nextCategory !== 'Semua') {
      params.set('kategori', nextCategory);
    } else {
      params.delete('kategori');
    }

    setSearchParams(params, { replace });
  };

  useEffect(() => {
    if (requestedCategory !== activeCategory) {
      setFilterParams(searchQuery, activeCategory, true);
    }
  }, [activeCategory, requestedCategory, searchQuery]);

  const filteredAmalan = amalanList.filter((item) => {
    const categoryMatch = activeCategory === 'Semua' || item.kategori_nama === activeCategory;
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return categoryMatch;
    }

    const searchMatch =
      item.judul.toLowerCase().includes(query) ||
      item.arti.toLowerCase().includes(query) ||
      item.isi_latin.toLowerCase().includes(query) ||
      item.kategori_nama.toLowerCase().includes(query) ||
      item.jumlah.toLowerCase().includes(query) ||
      item.waktu.toLowerCase().includes(query) ||
      item.catatan.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAmalan.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAmalan = filteredAmalan.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

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
            value={searchQuery}
            onChange={(e) => setFilterParams(e.target.value, activeCategory)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {kategoriList.map((kategori) => (
            <Badge
              key={kategori}
              variant="outline"
              onClick={() => setFilterParams(searchQuery, kategori)}
              className={`cursor-pointer hover:bg-emerald-50 ${activeCategory === kategori ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}`}
            >
              {kategori}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {paginatedAmalan.map((item) => {
          const sourceItems = normalizeSourceLinks(item.link_sumber);
          const firstSource = sourceItems[0] || '';
          const sourceHref = getSourceHref(firstSource);
          const artiPreview = firstWords(item.arti, 10);
          const catatanPreview = firstWords(item.catatan, 10);

          return (
            <Card key={item.id} className="group h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="subtle" className="bg-emerald-100 text-emerald-700 border-none">
                    {item.kategori_nama}
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

                <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-14">
                  {item.judul}
                </h3>

                <p className="text-sm text-muted-foreground mb-2 italic line-clamp-1 min-h-5">
                  "{artiPreview}"
                </p>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-1 min-h-5">
                  Jumlah: {item.jumlah || '-'} • Waktu: {item.waktu || '-'}
                </p>

                <p className="text-xs text-muted-foreground mb-2 line-clamp-1 min-h-5">
                  Catatan: {catatanPreview}
                </p>

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
          );
        })}
      </div>

      {filteredAmalan.length > 0 && totalPages > 1 && (
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

      {filteredAmalan.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Tidak ada amalan yang cocok dengan filter saat ini.
        </div>
      )}
    </div>
  );
}
