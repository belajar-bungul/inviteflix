'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Copy, Check, Navigation } from 'lucide-react';
import { ScheduleItem, VenueInfo } from '@/lib/types';

interface EventScheduleProps {
  schedule: ScheduleItem[];
  venue: VenueInfo;
  hostsNote?: string;
  showMaps?: boolean;
}

export default function EventSchedule({
  schedule,
  venue,
  hostsNote,
  showMaps = true,
}: EventScheduleProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${venue.name}, ${venue.address}`);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section id="schedule" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E50914] mb-1">
          <Calendar className="w-4 h-4" />
          <span>RUNDOWN & EPISODE GUIDE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Jadwal Acara & Lokasi
        </h2>
        {hostsNote && (
          <p className="text-sm sm:text-base text-neutral-400 mt-2 max-w-3xl leading-relaxed italic">
            &ldquo;{hostsNote}&rdquo;
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Schedule List (Left / 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-neutral-800 pb-2">
            <span>Daftar Episode Acara</span>
            <span className="text-xs text-neutral-500 font-normal">{schedule.length} Episodes Total</span>
          </div>

          {schedule.map((item, index) => (
            <div
              key={item.id || index}
              className="group bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-neutral-700 rounded-xl p-5 transition-all duration-300 shadow-md relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                {/* Episode Index Badge */}
                <div className="w-12 h-12 rounded-lg bg-[#262626] border border-neutral-700 flex flex-col items-center justify-center shrink-0 group-hover:border-[#E50914] transition-colors">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase">EP</span>
                  <span className="text-lg font-black text-white">{index + 1}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="bg-[#E50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                      {item.episodeBadge || `PART ${index + 1}`}
                    </span>
                    <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {item.time}
                    </span>
                    {item.duration && (
                      <span className="text-xs text-neutral-500">• {item.duration}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>

                  {item.subtitle && (
                    <p className="text-xs font-medium text-neutral-400 mb-1">
                      {item.subtitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-1">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400">
                    <MapPin className="w-3.5 h-3.5 text-[#E50914]" />
                    <span className="font-medium text-neutral-300">{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Venue Information & Maps (Right / 5 cols) */}
        <div className="lg:col-span-5 bg-[#181818] border border-[#2b2b2b] rounded-xl p-6 shadow-xl sticky top-24">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#E50914]" />
              <h3 className="text-lg font-bold text-white">Lokasi & Navigasi</h3>
            </div>
            <button
              onClick={handleCopyAddress}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white bg-neutral-800 px-2.5 py-1 rounded transition-colors"
              title="Salin Alamat Lengkap"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>

          {/* Venue Card */}
          <div className="space-y-3 mb-5">
            <h4 className="text-base font-bold text-white leading-tight">
              {venue.name}
            </h4>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {venue.address}
            </p>
            {venue.directionsNote && (
              <div className="bg-neutral-900/90 border-l-2 border-amber-500 p-2.5 rounded-r text-xs text-neutral-300">
                <span className="font-semibold text-amber-400 block mb-0.5">Catatan Akses & Parkir:</span>
                {venue.directionsNote}
              </div>
            )}
          </div>

          {/* Google Maps Embed */}
          {showMaps && venue.mapsEmbedUrl && (
            <div className="relative w-full h-56 rounded-lg overflow-hidden border border-neutral-700 mb-4 bg-neutral-900">
              <iframe
                title="Venue Map"
                src={venue.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="filter contrast-105 opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          )}

          {/* Direct Map Links */}
          {venue.mapsUrl && (
            <a
              href={venue.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold py-2.5 px-4 rounded text-sm transition-all shadow-md hover:scale-[1.02]"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka Petunjuk di Google Maps</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
