import React, { useState } from 'react';
import { Card, Button, Badge } from '@wearesyntesa/karbit-ui/react';
import { Plus, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'amalan' | 'kategori'>('amalan');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Kelola kategori dan amalan islami</p>
        </div>
        <Button className="bg-emerald-600 text-white gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Tambah {activeTab === 'amalan' ? 'Amalan' : 'Kategori'}
        </Button>
      </div>

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
                  <tr>
                    <td className="p-4 text-sm">1</td>
                    <td className="p-4 font-medium">Dzikir Pagi</td>
                    <td className="p-4"><Badge variant="subtle">Harian</Badge></td>
                    <td className="p-4 flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8"><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 text-rose-500"><Trash2 className="w-3 h-3" /></Button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 text-sm">2</td>
                    <td className="p-4 font-medium">Ayat Kursi</td>
                    <td className="p-4"><Badge variant="subtle">Perlindungan</Badge></td>
                    <td className="p-4 flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8"><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 text-rose-500"><Trash2 className="w-3 h-3" /></Button>
                    </td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="p-4 text-sm">1</td>
                    <td className="p-4 font-medium">Harian</td>
                    <td className="p-4"><LayoutGrid className="w-4 h-4" /></td>
                    <td className="p-4 flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8"><Edit2 className="w-3 h-3" /></Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 text-rose-500"><Trash2 className="w-3 h-3" /></Button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
