'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Star 
} from 'lucide-react';
import { getAllInvitations } from '@/lib/invitation-service';
import { Invitation } from '@/lib/types';
import { playTudumSound } from '@/lib/tudum-sound';

export default function HomePage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    getAllInvitations().then((data) => setInvitations(data));
  }, []);

  const featured = invitations[0];
  const weddings = invitations.filter(i => i.eventType === 'wedding');
  const corporate = invitations.filter(i => i.eventType === 'corporate' || i.eventType === 'product_launch');
  const birthdays = invitations.filter(i => i.eventType === 'birthday');

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 via-black/50 to-transparent py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#E50914] font-black tracking-widest text-2xl sm:text-3xl font-sans drop-shadow group-hover:scale-105 transition-transform">
              INVITEFLIX
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-neutral-300">
            <a href="#featured" className="hover:text-white transition-colors">Utama</a>
            <a href="#weddings" className="hover:text-white transition-colors">Pernikahan</a>
            <a href="#corporate" className="hover:text-white transition-colors">Korporat & Launch</a>
            <a href="#birthdays" className="hover:text-white transition-colors">Ulang Tahun</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B80710] text-white font-bold px-3.5 py-1.5 rounded text-xs transition-all shadow hover:scale-105"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </header>

      {/* Hero Billboard Showcase */}
      {featured && (
        <section id="featured" className="relative min-h-[82vh] flex items-center justify-start overflow-hidden pt-16 pb-12">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent sm:w-2/3" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full pt-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#E50914] text-white font-black text-xs px-2 py-0.5 rounded tracking-tighter">
                  N
                </span>
                <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-neutral-300">
                  FEATURED PREMIERE INVITATION
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-xl">
                {featured.title}
              </h1>

              <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold mb-4">
                <span className="text-emerald-400 font-bold">{featured.matchScore}% Match</span>
                <span className="text-neutral-400">{featured.releaseYear}</span>
                <span className="border border-neutral-600 px-1.5 py-0.5 rounded text-[10px] text-neutral-300">
                  {featured.maturityRating}
                </span>
                <span className="text-neutral-400">Ultra HD 4K</span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 line-clamp-3">
                {featured.synopsis}
              </p>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${featured.slug}`}
                  onClick={() => playTudumSound()}
                  className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold px-6 py-2.5 rounded text-sm transition-all shadow-xl hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Buka Undangan (TUDUM)</span>
                </Link>

                <Link
                  href={`/${featured.slug}?to=Budi+Santoso`}
                  className="flex items-center gap-2 bg-neutral-800/80 hover:bg-neutral-700 text-white font-semibold px-4 py-2.5 rounded text-sm border border-neutral-600 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Uji Personalisasi Nama (?to=...)</span>
                  <span className="sm:hidden">Personalisasi</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Showcase Carousels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12 -mt-10 relative z-20">
        {/* Row 1: Weddings */}
        {weddings.length > 0 && (
          <section id="weddings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#E50914]" />
                <span>Pernikahan Sinematik (Wedding Premieres)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {weddings.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/${inv.slug}`}
                  onClick={() => playTudumSound()}
                  className="group relative bg-[#181818] border border-neutral-800 hover:border-neutral-600 rounded-xl overflow-hidden netflix-card-hover"
                >
                  <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative">
                    <img
                      src={inv.coverImage}
                      alt={inv.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />
                    
                    <div className="absolute top-2 left-2 bg-[#E50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                      {inv.matchScore}% Match
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white text-base group-hover:text-red-400 transition-colors line-clamp-1">
                      {inv.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      {inv.hosts.primary} {inv.hosts.secondary ? `& ${inv.hosts.secondary}` : ''}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                      <span>{inv.venue.city}</span>
                      <span className="text-[#E50914] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Buka</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Row 2: Corporate & Tech Launch */}
        {corporate.length > 0 && (
          <section id="corporate" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>Peluncuran Produk & Acara Korporat (Keynotes)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {corporate.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/${inv.slug}`}
                  onClick={() => playTudumSound()}
                  className="group relative bg-[#181818] border border-neutral-800 hover:border-neutral-600 rounded-xl overflow-hidden netflix-card-hover"
                >
                  <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative">
                    <img
                      src={inv.coverImage}
                      alt={inv.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                      KEYNOTE
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white text-base group-hover:text-red-400 transition-colors line-clamp-1">
                      {inv.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      {inv.hosts.primary}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                      <span>{inv.venue.city}</span>
                      <span className="text-[#E50914] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Buka</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Row 3: Birthdays */}
        {birthdays.length > 0 && (
          <section id="birthdays" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>Pesta Ulang Tahun & Perayaan (Milestones)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {birthdays.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/${inv.slug}`}
                  onClick={() => playTudumSound()}
                  className="group relative bg-[#181818] border border-neutral-800 hover:border-neutral-600 rounded-xl overflow-hidden netflix-card-hover"
                >
                  <div className="aspect-video w-full overflow-hidden bg-neutral-900 relative">
                    <img
                      src={inv.coverImage}
                      alt={inv.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />
                    <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                      BIRTHDAY
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white text-base group-hover:text-red-400 transition-colors line-clamp-1">
                      {inv.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      {inv.hosts.primary}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                      <span>{inv.venue.city}</span>
                      <span className="text-[#E50914] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Buka</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Feature Highlights Grid */}
        <section className="pt-12 border-t border-neutral-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#E50914] block mb-1">
              SAAS ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Fitur & Keunggulan Inviteflix
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#E50914] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">Multi-Event & Multi-Type</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mendukung pernikahan, ulang tahun, corporate event, hingga product launch dalam satu skema yang skalabel.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#E50914] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Dynamic Feature Toggle</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Nyalakan/matikan bagian intro, countdown, rundown, cerita, galeri, amplop, dan buku tamu per ID undangan.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#E50914] flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Firestore Sync</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Buku tamu dan konfirmasi kehadiran (RSVP) tersinkronisasi instan secara real-time antar perangkat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#181818] border border-neutral-800 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 text-[#E50914] flex items-center justify-center font-bold">
                4
              </div>
              <h3 className="text-base font-bold text-white">Netflix Experience & TUDUM</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Dilengkapi modal &ldquo;Who&apos;s Watching?&rdquo;, sintesis suara TUDUM via Web Audio API, dan kartu hadiah digital QRIS.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-neutral-800 bg-[#0c0c0c] py-12 px-4 sm:px-8 text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#E50914] font-black text-xl">INVITEFLIX</span>
            <span>• SaaS Multi-Tenant Digital Invitation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/admin/login" className="hover:text-white transition-colors">
              Masuk Admin
            </Link>
            <Link href="/alex-sarah-wedding" className="hover:text-white transition-colors">
              Demo Wedding
            </Link>
            <Link href="/techcorp-nexus-2025" className="hover:text-white transition-colors">
              Demo Corporate
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
