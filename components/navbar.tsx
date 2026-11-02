'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, MessageSquare, Sparkles } from 'lucide-react';

interface NavbarProps {
  title?: string;
  isAudioPlaying?: boolean;
  onToggleAudio?: () => void;
  hasMusicFeature?: boolean;
  guestName?: string;
  adminLink?: boolean;
}

export default function NetflixNavbar({
  title,
  isAudioPlaying = false,
  onToggleAudio,
  hasMusicFeature = true,
  guestName,
  adminLink = true,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled
          ? 'bg-[#141414]/95 backdrop-blur-md shadow-2xl py-3 border-b border-[#262626]'
          : 'bg-gradient-to-b from-black/90 via-black/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-[#E50914] font-black tracking-widest text-2xl sm:text-3xl font-sans drop-shadow-md group-hover:scale-105 transition-transform">
              INVITEFLIX
            </span>
            {title && (
              <span className="hidden xl:inline text-xs font-semibold text-neutral-400 border-l border-neutral-700 pl-2 max-w-[200px] truncate">
                {title}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-neutral-300">
            <a href="#hero" className="hover:text-white transition-colors">Utama</a>
            <a href="#schedule" className="hover:text-white transition-colors">Jadwal & Acara</a>
            <a href="#story" className="hover:text-white transition-colors">Kisah Kami</a>
            <a href="#gallery" className="hover:text-white transition-colors">Galeri</a>
            <a href="#gift" className="hover:text-white transition-colors">Hadiah</a>
            <a href="#guestbook" className="hover:text-white transition-colors">Ucapan & RSVP</a>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {guestName && (
            <div className="hidden sm:flex items-center gap-2 bg-[#222222] border border-[#333333] px-3 py-1.5 rounded-full text-xs text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Untuk: <strong className="text-white">{guestName}</strong></span>
            </div>
          )}

          {/* Audio Mute/Unmute */}
          {hasMusicFeature && onToggleAudio && (
            <button
              onClick={onToggleAudio}
              title={isAudioPlaying ? 'Mute Music' : 'Play Music'}
              className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white transition-all flex items-center gap-1.5 text-xs"
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#E50914]" />
                  <span className="hidden sm:inline text-xs">Audio ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                  <span className="hidden sm:inline text-xs text-neutral-400">Audio OFF</span>
                </>
              )}
            </button>
          )}

          {/* Quick RSVP CTA */}
          <a
            href="#guestbook"
            className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B80710] text-white px-3.5 py-1.5 rounded text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-red-950/40"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>RSVP</span>
          </a>

          {adminLink && (
            <Link
              href="/admin/login"
              className="hidden lg:inline-flex text-xs text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 px-2.5 py-1.5 rounded transition-all"
            >
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
