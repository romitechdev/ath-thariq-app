import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import KarbitRegistrar from './components/KarbitRegistrar';
import { Moon, Sun, Heart, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <Router>
      <div className="min-h-screen transition-colors duration-300 bg-background text-foreground">
        <KarbitRegistrar />
        
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" aria-label="Jalur Langit" className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Logo Jalur Langit" className="w-8 h-8 shrink-0" />
              <img src="/logo-jalur-langit.svg" alt="Jalur Langit" className="hidden sm:block h-8 w-auto" />
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/" className="p-2 text-muted-foreground hover:text-emerald-600 transition-colors">
                Beranda
              </Link>
              <Link to="/favorit" className="p-2 text-muted-foreground hover:text-rose-500 transition-colors">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/admin" className="p-2 text-muted-foreground hover:text-emerald-600 transition-colors">
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        <main className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/amalan/:id" element={<Detail />} />
            <Route path="/favorit" element={<Favorites />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        <footer className="py-8 border-t border-border text-center text-muted-foreground text-sm">
          <p>© 2026 Jalur Langit. Dibangun dengan KarbitUI.</p>
        </footer>
      </div>
    </Router>
  );
}
