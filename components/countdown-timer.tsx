'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, Radio, Sparkles } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  title?: string;
  venueCity?: string;
}

export default function CountdownTimer({
  targetDate,
  title = 'Tayang Perdana Dalam',
  venueCity,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  const eventFormatted = useMemo(() => {
    try {
      return new Date(targetDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return targetDate;
    }
  }, [targetDate]);

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isPast: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);


  return (
    <section className="relative z-20 py-8 px-4 sm:px-6 -mt-8 max-w-5xl mx-auto">
      <div className="bg-[#181818]/90 backdrop-blur-md border border-[#2e2e2e] rounded-xl p-5 sm:p-7 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Header Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs uppercase font-extrabold text-[#E50914] tracking-widest mb-1">
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#E50914]" />
              <span>LIVE COUNTDOWN</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 flex items-center justify-center md:justify-start gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>{eventFormatted}</span>
              {venueCity && <span>• {venueCity}</span>}
            </p>
          </div>

          {/* Timer Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full md:w-auto">
            {[
              { label: 'HARI', value: timeLeft.days },
              { label: 'JAM', value: timeLeft.hours },
              { label: 'MENIT', value: timeLeft.minutes },
              { label: 'DETIK', value: timeLeft.seconds },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="bg-[#242424] border border-[#383838] rounded-lg p-2.5 sm:p-3.5 text-center min-w-[65px] sm:min-w-[85px] shadow-inner"
              >
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-neutral-400 tracking-wider mt-0.5">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {timeLeft.isPast && (
          <div className="mt-4 pt-3 border-t border-neutral-800 text-center text-xs text-amber-400 flex items-center justify-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acara ini telah berlangsung atau sedang disiarkan langsung.</span>
          </div>
        )}
      </div>
    </section>
  );
}
