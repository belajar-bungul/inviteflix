'use client';

import { useState } from 'react';
import { Camera, X, ChevronLeft, ChevronRight, Maximize2, Play } from 'lucide-react';
import { GalleryMedia } from '@/lib/types';

interface GalleryLightboxProps {
  gallery: GalleryMedia[];
  title?: string;
  subtitle?: string;
}

export default function GalleryLightbox({
  gallery,
  title = 'Galeri Sinematik',
  subtitle = 'Production Stills & Teasers',
}: GalleryLightboxProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!gallery || gallery.length === 0) return null;

  const categories = ['all', ...Array.from(new Set(gallery.map(g => g.category).filter(Boolean)))];

  const filteredMedia = activeCategory === 'all'
    ? gallery
    : gallery.filter(g => g.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredMedia.length);
  };

  const prevImage = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length);
  };

  const currentItem = lightboxIndex !== null ? filteredMedia[lightboxIndex] : null;

  return (
    <section id="gallery" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E50914] mb-1">
            <Camera className="w-4 h-4" />
            <span>TRAILERS & MORE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat || 'all')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all capitalize ${
                  activeCategory === cat
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                {cat === 'all' ? 'Semua Momen' : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
        {filteredMedia.map((item, idx) => (
          <div
            key={item.id || idx}
            onClick={() => openLightbox(idx)}
            className="group relative aspect-video sm:aspect-4/3 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-600 cursor-pointer netflix-card-hover"
          >
            <img
              src={item.url}
              alt={item.caption || 'Gallery photo'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white drop-shadow line-clamp-1">
                  {item.caption}
                </span>
                <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
                  {item.type === 'video' ? <Play className="w-3.5 h-3.5 fill-current" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-50 p-2.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-white transition-all hover:scale-110"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main media */}
          <div className="max-w-5xl max-h-[85vh] w-full flex flex-col items-center">
            <div className="relative max-h-[75vh] overflow-hidden rounded-lg">
              <img
                src={currentItem.url}
                alt={currentItem.caption}
                className="max-h-[75vh] w-auto object-contain mx-auto rounded-lg shadow-2xl"
              />
            </div>
            {/* Caption & Counter */}
            <div className="mt-4 text-center">
              <p className="text-white text-base font-semibold">
                {currentItem.caption}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {lightboxIndex! + 1} dari {filteredMedia.length}
                {currentItem.category ? ` • ${currentItem.category}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

