'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { loginAdmin, getStoredAdminUser } from '@/lib/auth-service';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const user = getStoredAdminUser();
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await loginAdmin(email, password);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('admin@inviteflix.com');
    setPassword('netflix2025');
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Poster Collage Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]" />

      {/* Top Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[#E50914] font-black tracking-widest text-3xl font-sans drop-shadow">
            INVITEFLIX
          </span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Admin Security Gateway</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-black/75 backdrop-blur-md border border-[#2b2b2b] rounded-2xl p-8 sm:p-10 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Masuk Admin
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Kelola undangan multi-tenant, toggle fitur per ID, dan moderasi buku tamu.
            </p>
          </div>

          {/* Firebase / Demo Status Tag */}
          <div className="mb-5 p-2.5 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Mode Autentikasi:</span>
            {isFirebaseConfigured ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ● Firebase Live Auth
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                ● Standalone / Demo Ready
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@inviteflix.com"
                  className="w-full bg-[#181818] border border-[#383838] focus:border-[#E50914] rounded-lg pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181818] border border-[#383838] focus:border-[#E50914] rounded-lg pl-10 pr-3.5 py-3 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#B80710] disabled:bg-neutral-800 text-white font-bold py-3.5 rounded-lg text-sm sm:text-base transition-all shadow-lg shadow-red-950/60 hover:scale-[1.01] mt-2"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3.5 py-2 rounded-lg border border-neutral-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gunakan Akun Demo (1-Click Fill)</span>
            </button>
            <p className="text-[11px] text-neutral-500 mt-2">
              Demo: <code>admin@inviteflix.com</code> / <code>netflix2025</code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-neutral-500">
        © 2025 INVITEFLIX Admin Gateway. Protected by enterprise session management.
      </footer>
    </div>
  );
}
