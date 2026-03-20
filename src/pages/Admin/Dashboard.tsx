import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@wearesyntesa/karbit-ui/react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

type CategoryItem = {
  id: number;
  nama: string;
  icon: string;
};

type AmalanAdminItem = {
  id: number;
  judul: string;
  kategori_id: number;
  kategori: string;
  isi_arab: string;
  isi_latin: string;
  arti: string;
  link_sumber?: string | null;
};

type CategoryForm = {
  nama: string;
  icon: string;
};

type AmalanForm = {
  judul: string;
  kategori_id: string;
  isi_arab: string;
  isi_latin: string;
  arti: string;
  link_sumber: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'amalan' | 'kategori'>('amalan');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [amalanItems, setAmalanItems] = useState<AmalanAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    nama: '',
    icon: '',
  });
  const [categoryFormError, setCategoryFormError] = useState('');

  const [isAmalanModalOpen, setIsAmalanModalOpen] = useState(false);
  const [amalanModalMode, setAmalanModalMode] = useState<'create' | 'edit'>('create');
  const [editingAmalanId, setEditingAmalanId] = useState<number | null>(null);
  const [amalanForm, setAmalanForm] = useState<AmalanForm>({
    judul: '',
    kategori_id: '',
    isi_arab: '',
    isi_latin: '',
    arti: '',
    link_sumber: '',
  });
  const [amalanFormError, setAmalanFormError] = useState('');

  const isBusy = isLoading || isSubmitting;

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  const fetchJson = async <T,>(url: string): Promise<T> => {
    const response = await fetch(url);
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || `Request gagal (${response.status})`);
    }

    return payload as T;
  };

  const mutateJson = async <T,>(
    url: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body?: Record<string, unknown>,
  ): Promise<T> => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || `Request gagal (${response.status})`);
    }

    return payload as T;
  };

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [kategori, amalan] = await Promise.all([
        fetchJson<CategoryItem[]>('/api/kategori'),
        fetchJson<AmalanAdminItem[]>('/api/amalan'),
      ]);

      setCategories(Array.isArray(kategori) ? kategori : []);
      setAmalanItems(Array.isArray(amalan) ? amalan : []);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Gagal mengambil data dashboard admin'));
    } finally {
      setIsLoading(false);
    }
  };

  const runMutation = async (
    action: () => Promise<void>,
    onError?: (message: string) => void,
  ): Promise<boolean> => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await action();
      await loadData();
      return true;
    } catch (error) {
      const message = getErrorMessage(error, 'Operasi gagal diproses');
      setErrorMessage(message);
      onError?.(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddKategoriModal = () => {
    setCategoryModalMode('create');
    setEditingCategoryId(null);
    setCategoryForm({ nama: '', icon: '' });
    setCategoryFormError('');
    setIsCategoryModalOpen(true);
  };

  const openEditKategoriModal = (item: CategoryItem) => {
    setCategoryModalMode('edit');
    setEditingCategoryId(item.id);
    setCategoryForm({
      nama: item.nama,
      icon: item.icon,
    });
    setCategoryFormError('');
    setIsCategoryModalOpen(true);
  };

  const closeKategoriModal = () => {
    if (isSubmitting) return;

    setIsCategoryModalOpen(false);
    setCategoryFormError('');
  };

  const openAddAmalanModal = () => {
    if (categories.length === 0) {
      setErrorMessage('Belum ada kategori. Tambahkan kategori terlebih dahulu.');
      return;
    }

    setAmalanModalMode('create');
    setEditingAmalanId(null);
    setAmalanForm({
      judul: '',
      kategori_id: String(categories[0].id),
      isi_arab: '',
      isi_latin: '',
      arti: '',
      link_sumber: '',
    });
    setAmalanFormError('');
    setIsAmalanModalOpen(true);
  };

  const openEditAmalanModal = (item: AmalanAdminItem) => {
    setAmalanModalMode('edit');
    setEditingAmalanId(item.id);
    setAmalanForm({
      judul: item.judul,
      kategori_id: String(item.kategori_id),
      isi_arab: item.isi_arab,
      isi_latin: item.isi_latin,
      arti: item.arti,
      link_sumber: item.link_sumber || '',
    });
    setAmalanFormError('');
    setIsAmalanModalOpen(true);
  };

  const closeAmalanModal = () => {
    if (isSubmitting) return;

    setIsAmalanModalOpen(false);
    setAmalanFormError('');
  };

  const handleDeleteKategori = async (item: CategoryItem) => {
    const confirmed = window.confirm(`Hapus kategori "${item.nama}"?`);
    if (!confirmed) return;

    await runMutation(async () => {
      await mutateJson(`/api/kategori/${item.id}`, 'DELETE');
    });
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nama = categoryForm.nama.trim();
    const icon = categoryForm.icon.trim();

    if (!nama || !icon) {
      setCategoryFormError('Nama dan icon kategori wajib diisi.');
      return;
    }

    setCategoryFormError('');

    const success = await runMutation(
      async () => {
        if (categoryModalMode === 'create') {
          await mutateJson('/api/kategori', 'POST', { nama, icon });
          return;
        }

        if (!editingCategoryId) {
          throw new Error('Kategori yang akan diubah tidak ditemukan.');
        }

        await mutateJson(`/api/kategori/${editingCategoryId}`, 'PUT', { nama, icon });
      },
      (message) => setCategoryFormError(message),
    );

    if (success) {
      closeKategoriModal();
    }
  };

  const handleAmalanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const judul = amalanForm.judul.trim();
    const isi_arab = amalanForm.isi_arab.trim();
    const isi_latin = amalanForm.isi_latin.trim();
    const arti = amalanForm.arti.trim();
    const link_sumber = amalanForm.link_sumber.trim();
    const kategoriId = Number(amalanForm.kategori_id);

    const kategoriExists = categories.some((item) => item.id === kategoriId);

    if (!judul || !isi_arab || !isi_latin || !arti) {
      setAmalanFormError('Judul, isi arab, isi latin, dan arti wajib diisi.');
      return;
    }

    if (!Number.isInteger(kategoriId) || !kategoriExists) {
      setAmalanFormError('Kategori wajib dipilih dengan benar.');
      return;
    }

    setAmalanFormError('');

    const success = await runMutation(
      async () => {
        if (amalanModalMode === 'create') {
          await mutateJson('/api/amalan', 'POST', {
            judul,
            kategori_id: kategoriId,
            isi_arab,
            isi_latin,
            arti,
            link_sumber,
          });
          return;
        }

        if (!editingAmalanId) {
          throw new Error('Amalan yang akan diubah tidak ditemukan.');
        }

        await mutateJson(`/api/amalan/${editingAmalanId}`, 'PUT', {
          judul,
          kategori_id: kategoriId,
          isi_arab,
          isi_latin,
          arti,
          link_sumber,
        });
      },
      (message) => setAmalanFormError(message),
    );

    if (success) {
      closeAmalanModal();
    }
  };

  const handleDeleteAmalan = async (item: AmalanAdminItem) => {
    const confirmed = window.confirm(`Hapus amalan "${item.judul}"?`);
    if (!confirmed) return;

    await runMutation(async () => {
      await mutateJson(`/api/amalan/${item.id}`, 'DELETE');
    });
  };

  const handleAdd = async () => {
    if (activeTab === 'amalan') {
      openAddAmalanModal();
      return;
    }

    openAddKategoriModal();
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola kategori dan amalan islami</p>
        </div>
        <Button onClick={handleAdd} disabled={isBusy} className="bg-emerald-600 text-white gap-2 rounded-xl disabled:opacity-70">
          <Plus className="w-4 h-4" />
          Tambah {activeTab === 'amalan' ? 'Amalan' : 'Kategori'}
        </Button>
      </div>

      {errorMessage && (
        <div className="mb-6 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {errorMessage}
        </div>
      )}

      <div className="flex gap-4 mb-8 border-b border-border">
        <button 
          onClick={() => setActiveTab('amalan')}
          className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'amalan' ? 'text-emerald-600' : 'text-muted-foreground'}`}
        >
          Amalan
          {activeTab === 'amalan' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>
        <button 
          onClick={() => setActiveTab('kategori')}
          className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'kategori' ? 'text-emerald-600' : 'text-muted-foreground'}`}
        >
          Kategori
          {activeTab === 'kategori' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>
      </div>

      <Card className="border-none shadow-lg bg-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-4 font-semibold text-sm">ID</th>
                <th className="p-4 font-semibold text-sm">{activeTab === 'amalan' ? 'Judul' : 'Nama Kategori'}</th>
                <th className="p-4 font-semibold text-sm">{activeTab === 'amalan' ? 'Kategori' : 'Icon'}</th>
                <th className="p-4 font-semibold text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeTab === 'amalan' ? (
                <>
                  {isLoading ? (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={4}>Memuat data amalan...</td>
                    </tr>
                  ) : amalanItems.length === 0 ? (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={4}>Belum ada amalan.</td>
                    </tr>
                  ) : (
                    amalanItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-4 text-sm">{item.id}</td>
                        <td className="p-4 font-medium">{item.judul}</td>
                        <td className="p-4">
                          <Badge variant="subtle">{item.kategori}</Badge>
                        </td>
                        <td className="p-4 flex gap-2">
                          <Button onClick={() => openEditAmalanModal(item)} disabled={isBusy} variant="outline" size="sm" className="h-8 w-8">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button onClick={() => handleDeleteAmalan(item)} disabled={isBusy} variant="outline" size="sm" className="h-8 w-8 text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </>
              ) : (
                <>
                  {isLoading ? (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={4}>Memuat data kategori...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={4}>Belum ada kategori.</td>
                    </tr>
                  ) : (
                    categories.map((item) => (
                      <tr key={item.id}>
                        <td className="p-4 text-sm">{item.id}</td>
                        <td className="p-4 font-medium">{item.nama}</td>
                        <td className="p-4 text-xl leading-none">{item.icon}</td>
                        <td className="p-4 flex gap-2">
                          <Button onClick={() => openEditKategoriModal(item)} disabled={isBusy} variant="outline" size="sm" className="h-8 w-8">
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button onClick={() => handleDeleteKategori(item)} disabled={isBusy} variant="outline" size="sm" className="h-8 w-8 text-rose-500">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card rounded-2xl border-none shadow-2xl p-6">
            <h2 className="text-xl font-semibold mb-1">
              {categoryModalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Isi data kategori lalu simpan perubahan.
            </p>

            {categoryFormError && (
              <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {categoryFormError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Kategori</label>
                <input
                  type="text"
                  value={categoryForm.nama}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, nama: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="Contoh: Harian"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  placeholder="Contoh: 📿"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={closeKategoriModal}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {isAmalanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-card rounded-2xl border-none shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-1">
              {amalanModalMode === 'create' ? 'Tambah Amalan' : 'Edit Amalan'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Isi data amalan lalu simpan perubahan.
            </p>

            {amalanFormError && (
              <div className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {amalanFormError}
              </div>
            )}

            <form onSubmit={handleAmalanSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Judul</label>
                <input
                  type="text"
                  value={amalanForm.judul}
                  onChange={(e) => setAmalanForm((prev) => ({ ...prev, judul: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <select
                  value={amalanForm.kategori_id}
                  onChange={(e) => setAmalanForm((prev) => ({ ...prev, kategori_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  required
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Isi Arab</label>
                <textarea
                  value={amalanForm.isi_arab}
                  onChange={(e) => setAmalanForm((prev) => ({ ...prev, isi_arab: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-24"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Isi Latin</label>
                <textarea
                  value={amalanForm.isi_latin}
                  onChange={(e) => setAmalanForm((prev) => ({ ...prev, isi_latin: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Arti</label>
                <textarea
                  value={amalanForm.arti}
                  onChange={(e) => setAmalanForm((prev) => ({ ...prev, arti: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-20"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sumber / Link (opsional)</label>
                <input
                  type="text"
                  value={amalanForm.link_sumber}
                  onChange={(e) => setAmalanForm((prev) => ({ ...prev, link_sumber: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={closeAmalanModal}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
