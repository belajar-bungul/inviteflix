'use client';

import { useState } from 'react';
import { Play, Calendar, MapPin, Check, Share2, Sparkles } from 'lucide-react';
import { Invitation } from '@/lib/types';

interface HeroBannerProps {
  invitation: Invitation;
  guestName?: string;
  onOpenPlay?: () => void;
}

export default function HeroBanner({
  invitation,
  guestName,
  onOpenPlay,
}: HeroBannerProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  // Download .ics calendar event
  const handleAddToCalendar = () => {
    const startDate = new Date(invitation.eventDate);
    const endDate = invitation.eventEndDate
      ? new Date(invitation.eventEndDate)
      : new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

    const formatIcsDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Inviteflix//Digital Invitation//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${invitation.title}`,
      `DESCRIPTION:${invitation.synopsis.replace(/\n/g, ' ')}`,
      `LOCATION:${invitation.venue.name}, ${invitation.venue.address}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invitation.slug}-inviteflix.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: invitation.title,
          text: invitation.synopsis,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-start overflow-hidden pt-20 pb-16">
      {/* Background Image with Netflix Multi-layer Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={invitation.coverImage}
          alt={invitation.title}
          className="w-full h-full object-cover object-center scale-105 transform animate-fade-in"
        />
        {/* Dark Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent sm:w-3/4" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414]/80 via-transparent to-transparent h-32" />
      </div>

      {/* Main Billboard Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-10">
        <div className="max-w-2xl text-left">
          {/* Netflix Series Tagline */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#E50914] text-white font-black text-xs px-2 py-0.5 rounded tracking-tighter">
              N
            </span>
            <span className="text-xs uppercase font-extrabold tracking-[0.25em] text-neutral-300">
              {invitation.eventType.toUpperCase()} PREMIERE
            </span>
          </div>

          {/* Guest Personalization Banner */}
          {guestName && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-950/80 to-black/60 border-l-4 border-[#E50914] px-4 py-2 rounded-r-md mb-4 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-xs sm:text-sm text-neutral-200">
                Spesial Ditujukan Kepada:{' '}
                <strong className="text-white font-bold">{guestName}</strong>
              </div>
            </div>
          )}

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-2 drop-shadow-2xl">
            {invitation.title}
          </h1>

          {/* Hosts Subheading */}
          <div className="text-lg sm:text-xl font-semibold text-neutral-200 mb-4 flex items-center gap-2">
            <span>{invitation.hosts.primary}</span>
            {invitation.hosts.secondary && (
              <>
                <span className="text-[#E50914] font-bold">&</span>
                <span>{invitation.hosts.secondary}</span>
              </>
            )}
          </div>

          {/* Metadata Badges: Match, Year, Rating, HD */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold mb-5">
            <span className="text-emerald-400 font-bold">
              {invitation.matchScore}% Match
            </span>
            <span className="text-neutral-300">
              {invitation.releaseYear || new Date(invitation.eventDate).getFullYear()}
            </span>
            <span className="border border-neutral-600 bg-neutral-900/60 px-1.5 py-0.5 rounded text-[11px] text-neutral-300">
              {invitation.maturityRating || 'ALL'}
            </span>
            <span className="border border-neutral-600 bg-neutral-900/60 px-1.5 py-0.5 rounded text-[11px] text-neutral-300">
              Ultra HD 4K
            </span>
            <span className="text-neutral-400 text-xs">
              {invitation.genres?.slice(0, 3).join(' • ')}
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-8 max-w-xl line-clamp-4 sm:line-clamp-none drop-shadow">
            {invitation.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Play Button */}
            <a
              href="#schedule"
              onClick={onOpenPlay}
              className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-bold px-6 py-3 rounded text-sm sm:text-base transition-all shadow-xl hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Buka Acara</span>
            </a>

            {/* Save to Calendar Button */}
            <button
              onClick={handleAddToCalendar}
              className="flex items-center gap-2 bg-neutral-800/80 hover:bg-neutral-700/80 text-white font-semibold px-4 py-3 rounded text-sm sm:text-base border border-neutral-600 backdrop-blur-sm transition-all hover:scale-105"
            >
              <Calendar className="w-4 h-4 text-neutral-300" />
              <span>Simpan Tanggal</span>
            </button>

            {/* Google Maps Shortcut */}
            {invitation.venue.mapsUrl && (
              <a
                href={invitation.venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-neutral-800/80 hover:bg-neutral-700/80 text-white font-semibold px-4 py-3 rounded text-sm sm:text-base border border-neutral-600 backdrop-blur-sm transition-all hover:scale-105"
              >
                <MapPin className="w-4 h-4 text-[#E50914]" />
                <span className="hidden sm:inline">Lokasi</span>
              </a>
            )}

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-3 rounded bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white transition-all"
              title="Share Invitation"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
