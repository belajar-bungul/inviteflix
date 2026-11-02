'use client';

import { useState } from 'react';
import { Play, Sparkles, User, Heart, Briefcase, Award } from 'lucide-react';
import { playTudumSound } from '@/lib/tudum-sound';

interface WhosWatchingModalProps {
  isOpen: boolean;
  onEnter: () => void;
  guestName?: string;
  eventTitle: string;
  hosts: { primary: string; secondary?: string };
}

export default function WhosWatchingModal({
  isOpen,
  onEnter,
  guestName,
  eventTitle,
  hosts,
}: WhosWatchingModalProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleProfileSelect = (name: string) => {
    setSelectedProfile(name);
    playTudumSound();
    setIsClosing(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const profiles = [
    ...(guestName
      ? [
          {
            id: 'custom-guest',
            name: guestName,
            role: 'Tamu Istimewa / VIP',
            color: 'from-red-600 to-rose-700',
            icon: Award,
          },
        ]
      : []),
    {
      id: 'general-guest',
      name: 'Tamu Undangan',
      role: 'Honored Guest',
      color: 'from-blue-600 to-indigo-700',
      icon: User,
    },
    {
      id: 'family-friend',
      name: 'Keluarga & Sahabat',
      role: 'Close Circle',
      color: 'from-emerald-600 to-teal-700',
      icon: Heart,
    },
    {
      id: 'colleague',
      name: 'Rekan & Kerabat',
      role: 'Colleagues & Partners',
      color: 'from-purple-600 to-violet-700',
      icon: Briefcase,
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#141414] transition-all duration-700 ${
        isClosing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background cinematic vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-[#141414] to-black opacity-90" />

      <div className="relative z-10 max-w-4xl w-full px-6 py-8 text-center flex flex-col items-center">
        {/* Netflix Red Logo */}
        <div className="mb-4">
          <span className="text-[#E50914] font-black tracking-widest text-3xl sm:text-4xl drop-shadow-[0_4px_12px_rgba(229,9,20,0.5)]">
            INVITEFLIX
          </span>
          <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1">
            Exclusive Premiere Invitation
          </p>
        </div>

        {/* Title / Who's Watching Header */}
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
          Siapa yang Menonton?
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto mb-1">
          {eventTitle}
        </p>
        <p className="text-xs text-neutral-500 max-w-md mx-auto mb-8">
          Diselenggarakan oleh {hosts.primary} {hosts.secondary ? `& ${hosts.secondary}` : ''}
        </p>

        {/* Profile Avatars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10 w-full max-w-3xl">
          {profiles.slice(0, 4).map((p) => {
            const Icon = p.icon;
            const isSelected = selectedProfile === p.name;
            return (
              <button
                key={p.id}
                onClick={() => handleProfileSelect(p.name)}
                className={`group flex flex-col items-center p-3 rounded-xl transition-all duration-300 focus:outline-none ${
                  isSelected ? 'scale-105' : 'hover:scale-105'
                }`}
              >
                {/* Avatar Box */}
                <div
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-lg bg-gradient-to-br ${p.color} p-0.5 shadow-xl transition-all duration-300 group-hover:ring-4 group-hover:ring-white/80 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="w-full h-full bg-[#181818]/60 backdrop-blur-xs rounded-[7px] flex flex-col items-center justify-center">
                    <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white/90 group-hover:text-white transition-colors" />
                  </div>
                  {p.id === 'custom-guest' && (
                    <div className="absolute top-1.5 right-1.5 bg-[#E50914] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      VIP
                    </div>
                  )}
                </div>

                {/* Name */}
                <span className="mt-3 text-sm sm:text-base font-semibold text-neutral-300 group-hover:text-white transition-colors line-clamp-1">
                  {p.name}
                </span>
                <span className="text-[11px] text-neutral-500 group-hover:text-neutral-400">
                  {p.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main CTA: Play Trailer / Open Invitation */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => handleProfileSelect(guestName || 'Tamu Undangan')}
            className="flex items-center gap-2.5 bg-[#E50914] hover:bg-[#B80710] text-white font-bold px-8 py-3.5 rounded-md text-base sm:text-lg transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] hover:shadow-[0_0_30px_rgba(229,9,20,0.8)] hover:scale-105"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Putar Undangan (TUDUM)</span>
          </button>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 text-neutral-500 text-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
          <span>Klik profil untuk memutar suara sinematik & membuka pengalaman penuh</span>
        </div>
      </div>
    </div>
  );
}
