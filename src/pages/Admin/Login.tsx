import React, { useState } from 'react';
import { Card, Button } from '@wearesyntesa/karbit-ui/react';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login
    if (email === 'admin@jalurlangit.com' && password === 'admin123') {
      window.location.href = '/admin/dashboard';
    } else {
      alert('Login gagal. Gunakan admin@jalurlangit.com / admin123');
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
            <label className="text-sm font-medium">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@jalurlangit.com"
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

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-xl gap-2">
            <LogIn className="w-5 h-5" />
            Masuk ke Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
