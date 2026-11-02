'use client';

import { useEffect, useRef } from 'react';
import { VolumeX, Disc3 } from 'lucide-react';

interface AudioControllerProps {
  musicUrl?: string;
  autoPlay?: boolean;
  isPlaying: boolean;
  onToggle: () => void;
  trackTitle?: string;
}

export default function AudioController({
  musicUrl,
  isPlaying,
  onToggle,
  trackTitle = 'Inviteflix Original Soundtrack (OST)',
}: AudioControllerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(musicUrl || 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cinematic-romantic-love-story-112196.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.warn('Audio auto-play prevented by browser policy:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, musicUrl]);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        onClick={onToggle}
        className="group flex items-center gap-2.5 bg-[#1a1a1a]/95 hover:bg-[#252525] border border-neutral-700 hover:border-[#E50914] p-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all hover:scale-105"
        title={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        <div className="relative flex items-center justify-center">
          <Disc3
            className={`w-5 h-5 sm:w-6 sm:h-6 text-[#E50914] transition-all ${
              isPlaying ? 'animate-spin' : 'opacity-70'
            }`}
            style={{ animationDuration: '4s' }}
          />
        </div>

        {/* Animated equalizer waves */}
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-4 px-1">
            <span className="w-1 bg-[#E50914] rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
            <span className="w-1 bg-[#E50914] rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
            <span className="w-1 bg-[#E50914] rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
            <span className="w-1 bg-[#E50914] rounded-full animate-bounce h-3.5" style={{ animationDelay: '75ms' }} />
          </div>
        ) : (
          <VolumeX className="w-4 h-4 text-neutral-400" />
        )}

        <span className="hidden sm:inline text-xs font-semibold text-neutral-200 group-hover:text-white max-w-[140px] truncate">
          {isPlaying ? trackTitle : 'Audio Dijeda'}
        </span>
      </button>
    </div>
  );
}
