'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import { StoryEpisode } from '@/lib/types';

interface StoryTimelineProps {
  episodes: StoryEpisode[];
  title?: string;
  subtitle?: string;
}

export default function StoryTimeline({
  episodes,
  title = 'Kisah Perjalanan Kami',
  subtitle = 'Season 1 • How We Reached Forever',
}: StoryTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const offset = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollTo({
      left: scrollLeft + offset,
      behavior: 'smooth',
    });
  };

  if (!episodes || episodes.length === 0) return null;

  return (
    <section id="story" className="py-16 relative overflow-hidden bg-gradient-to-b from-transparent via-neutral-950/60 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E50914] mb-1">
            <Film className="w-4 h-4" />
            <span>ORIGINAL SERIES</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white transition-all shadow hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-white transition-all shadow hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-6 lg:px-8 pb-8 pt-2 scroll-smooth"
      >
        {episodes.map((ep, idx) => (
          <div
            key={ep.id || idx}
            className="group relative flex-none w-[280px] sm:w-[340px] bg-[#1a1a1a] rounded-xl overflow-hidden border border-[#2a2a2a] hover:border-neutral-600 transition-all duration-300 netflix-card-hover"
          >
            {/* Image Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
              <img
                src={ep.imageUrl}
                alt={ep.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-black/30" />
              
              {/* Top badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="bg-[#E50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                  EP {ep.episodeNumber || idx + 1}
                </span>
                {ep.year && (
                  <span className="bg-black/70 backdrop-blur-xs text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                    {ep.year}
                  </span>
                )}
              </div>

              {ep.duration && (
                <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-neutral-300 bg-black/60 px-1.5 py-0.5 rounded">
                  {ep.duration}
                </div>
              )}
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-1">
                {ep.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed line-clamp-3">
                {ep.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
