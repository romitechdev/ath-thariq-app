import React, { useState } from 'react';
import { Card, Button } from '@wearesyntesa/karbit-ui/react';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        window.location.href = '/admin/dashboard';
        return;
      }

      const payload = await response.json().catch(() => null);
      alert(payload?.message || 'Login gagal. Periksa username dan password.');
    } catch {
      alert('Tidak dapat terhubung ke server. Pastikan API server berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl bg-card rounded-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground">Kelola konten Jalur Langit</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl gap-2 disabled:opacity-70">
            <LogIn className="w-5 h-5" />
            {isLoading ? 'Memproses...' : 'Masuk ke Dashboard'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
