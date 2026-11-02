'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Pin, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishComment, AttendanceStatus } from '@/lib/types';
import { subscribeToWishes, addWishComment } from '@/lib/invitation-service';

interface GuestbookRsvpProps {
  invitationId: string;
  guestName?: string;
  title?: string;
  subtitle?: string;
}

export default function GuestbookRsvp({
  invitationId,
  guestName,
  title = 'Buku Tamu & Konfirmasi Kehadiran (RSVP)',
  subtitle = 'Reviews & Audience Reactions',
}: GuestbookRsvpProps) {
  const [wishes, setWishes] = useState<WishComment[]>([]);
  const [filter, setFilter] = useState<'all' | AttendanceStatus>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Form states
  const [name, setName] = useState(guestName || '');
  const [relationship, setRelationship] = useState('Sahabat / Friend');
  const [attendance, setAttendance] = useState<AttendanceStatus>('hadir');
  const [pax, setPax] = useState<number>(1);
  const [message, setMessage] = useState('');

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToWishes(invitationId, (updatedWishes) => {
      setWishes(updatedWishes);
    });
    return () => unsubscribe();
  }, [invitationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await addWishComment({
        invitationId,
        name: name.trim(),
        relationship,
        attendance,
        pax: attendance === 'hadir' ? pax : 0,
        message: message.trim(),
      });

      // Trigger celebration confetti
      if (typeof window !== 'undefined') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E50914', '#FFD700', '#FFFFFF', '#FF4500'],
        });
      }

      setHasSubmitted(true);
      setMessage('');
      setTimeout(() => setHasSubmitted(false), 5000);
    } catch (err) {
      console.error('Failed to submit wish', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredWishes = filter === 'all'
    ? wishes
    : wishes.filter(w => w.attendance === filter);

  // Attendance status badge helper
  const renderAttendanceBadge = (status: AttendanceStatus, guestPax?: number) => {
    switch (status) {
      case 'hadir':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Hadir {guestPax ? `(${guestPax} Orang)` : ''}</span>
          </span>
        );
      case 'tidak_hadir':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded">
            <XCircle className="w-3 h-3 text-rose-400" />
            <span>Tidak Hadir</span>
          </span>
        );
      case 'ragu':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>Masih Ragu</span>
          </span>
        );
    }
  };

  // Avatar color helper
  const avatarColors = [
    'from-red-600 to-rose-700',
    'from-blue-600 to-indigo-700',
    'from-emerald-600 to-teal-700',
    'from-purple-600 to-violet-700',
    'from-amber-600 to-orange-700',
  ];

  const formatRelativeTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <section id="guestbook" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-10 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-black uppercase tracking-widest text-[#E50914] mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>REAL-TIME AUDIENCE FEED</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* RSVP & Wish Form (Left / 5 cols) */}
        <div className="lg:col-span-5 bg-[#181818] border border-[#2c2c2c] rounded-2xl p-6 sm:p-7 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-800">
            <Sparkles className="w-5 h-5 text-[#E50914]" />
            <h3 className="text-lg font-bold text-white">Kirim Ucapan & RSVP</h3>
          </div>

          {hasSubmitted && (
            <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Terima kasih! Ucapan & konfirmasi kehadiran Anda berhasil dikirim secara real-time.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Nama Lengkap / Panggilan *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso & Partner"
                className="w-full bg-[#121212] border border-[#333333] focus:border-[#E50914] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Hubungan / Kategori
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full bg-[#121212] border border-[#333333] focus:border-[#E50914] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
              >
                <option value="Sahabat / Friend">Sahabat / Teman Dekat</option>
                <option value="Keluarga / Family">Keluarga Besar</option>
                <option value="Rekan Kerja / Colleague">Rekan Kerja / Kantor</option>
                <option value="Tamu VIP">Tamu VIP</option>
                <option value="Kerabat Lainnya">Kerabat Lainnya</option>
              </select>
            </div>

            {/* Attendance Radios */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Konfirmasi Kehadiran *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hadir', label: 'Hadir', icon: CheckCircle2, color: 'hover:border-emerald-500' },
                  { id: 'tidak_hadir', label: 'Tidak Hadir', icon: XCircle, color: 'hover:border-rose-500' },
                  { id: 'ragu', label: 'Ragu', icon: HelpCircle, color: 'hover:border-amber-500' },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = attendance === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => setAttendance(opt.id as AttendanceStatus)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#E50914] border-[#E50914] text-white shadow-md'
                          : `bg-[#121212] border-[#333333] text-neutral-400 ${opt.color}`
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pax Selector (if Hadir) */}
            {attendance === 'hadir' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Jumlah Orang yang Hadir
                </label>
                <select
                  value={pax}
                  onChange={(e) => setPax(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#333333] focus:border-[#E50914] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors"
                >
                  <option value={1}>1 Orang (Sendiri)</option>
                  <option value={2}>2 Orang (Bersama Pasangan)</option>
                  <option value={3}>3 Orang</option>
                  <option value={4}>4 Orang (Keluarga)</option>
                  <option value={5}>5+ Orang</option>
                </select>
              </div>
            )}

            {/* Message / Wish Textarea */}
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                Ucapan & Doa Hangat *
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tuliskan ucapan selamat dan doa terbaik Anda..."
                className="w-full bg-[#121212] border border-[#333333] focus:border-[#E50914] rounded-lg p-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#B80710] disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-red-950/50 hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirim...' : 'Kirim Ucapan (Review)'}</span>
            </button>
          </form>
        </div>

        {/* Real-time Wishes Stream (Right / 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div className="text-sm font-bold text-neutral-300">
              Total Ucapan ({wishes.length})
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'hadir', label: 'Hadir' },
                { id: 'tidak_hadir', label: 'Tidak Hadir' },
                { id: 'ragu', label: 'Ragu' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as 'all' | AttendanceStatus)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors font-semibold ${
                    filter === tab.id
                      ? 'bg-neutral-700 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wishes List */}
          <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredWishes.length === 0 ? (
              <div className="text-center py-12 bg-[#181818] rounded-xl border border-neutral-800 p-6 text-neutral-500 text-sm">
                Belum ada ucapan pada kategori ini. Jadilah yang pertama memberikan doa dan ucapan!
              </div>
            ) : (
              filteredWishes.map((item) => (
                <div
                  key={item.id}
                  className={`relative p-4 sm:p-5 rounded-xl border transition-all ${
                    item.isPinned
                      ? 'bg-[#1e1b1b] border-amber-500/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                      : 'bg-[#181818] border-[#292929] hover:border-neutral-700'
                  }`}
                >
                  {/* Pinned Tag */}
                  {item.isPinned && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>PINNED</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
                        avatarColors[(item.avatarIndex ?? 0) % avatarColors.length]
                      } flex items-center justify-center text-white font-bold text-sm shadow shrink-0`}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {item.name}
                        </span>
                        {item.relationship && (
                          <span className="text-xs text-neutral-400 font-medium">
                            • {item.relationship}
                          </span>
                        )}
                        {renderAttendanceBadge(item.attendance, item.pax)}
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed break-words mt-1">
                        {item.message}
                      </p>

                      <div className="text-[11px] text-neutral-500 mt-2 font-mono">
                        {formatRelativeTime(item.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
