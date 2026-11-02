'use client';

import { useState } from 'react';
import { Gift, Copy, Check, QrCode, X, CreditCard } from 'lucide-react';
import { DonationAccount } from '@/lib/types';

interface DonationRegistryProps {
  donations: DonationAccount[];
  title?: string;
  subtitle?: string;
}

export default function DonationRegistry({
  donations,
  title = 'Tanda Kasih & Amplop Digital',
  subtitle = 'Netflix Digital Gift Card & Wedding Registry',
}: DonationRegistryProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedQris, setSelectedQris] = useState<DonationAccount | null>(null);

  if (!donations || donations.length === 0) return null;

  const handleCopy = async (acc: DonationAccount) => {
    try {
      await navigator.clipboard.writeText(acc.accountNumber);
      setCopiedId(acc.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <section id="gift" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E50914] mb-1">
          <Gift className="w-4 h-4" />
          <span>{subtitle}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda berkehendak memberikan tanda kasih, Anda dapat menyalurkannya melalui amplop digital di bawah ini.
        </p>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {donations.map((acc) => (
          <div
            key={acc.id}
            className="group relative bg-gradient-to-br from-[#1f1f1f] to-[#121212] border border-[#333333] hover:border-[#E50914]/80 rounded-2xl p-6 sm:p-7 shadow-2xl transition-all duration-300 netflix-card-hover overflow-hidden"
          >
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E50914] via-rose-500 to-amber-500" />

            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#E50914] shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                    {acc.notes || 'Digital Gift Envelope'}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {acc.bankName}
                  </h3>
                </div>
              </div>

              {/* QRIS trigger button if available */}
              {acc.qrisImageUrl && (
                <button
                  onClick={() => setSelectedQris(acc)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-neutral-700 transition-all"
                >
                  <QrCode className="w-4 h-4 text-[#E50914]" />
                  <span>QRIS</span>
                </button>
              )}
            </div>

            {/* Account Number Box */}
            <div className="bg-[#141414] border border-[#2b2b2b] rounded-xl p-3.5 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase font-mono">Nomor Rekening</span>
                <span className="text-lg sm:text-xl font-mono font-black text-white tracking-wider">
                  {acc.accountNumber}
                </span>
              </div>
              <button
                onClick={() => handleCopy(acc)}
                className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold px-3 py-2 rounded-lg transition-all shadow hover:scale-105"
              >
                {copiedId === acc.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* Account Holder */}
            <div className="text-xs text-neutral-400">
              Atas Nama: <strong className="text-neutral-200 font-semibold">{acc.accountHolder}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* QRIS Modal */}
      {selectedQris && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-[#1c1c1c] border border-neutral-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <button
              onClick={() => setSelectedQris(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#E50914] tracking-widest uppercase mb-1">
              <QrCode className="w-4 h-4" />
              <span>QRIS PAYMENT CODE</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">
              Scan QRIS {selectedQris.bankName}
            </h3>

            <div className="p-4 bg-white rounded-xl inline-block shadow-inner mb-4">
              <img
                src={selectedQris.qrisImageUrl}
                alt="QRIS code"
                className="w-56 h-56 object-contain mx-auto"
              />
            </div>

            <p className="text-xs text-neutral-300 font-medium">
              a.n. {selectedQris.accountHolder}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Bisa discan melalui GoPay, OVO, Dana, BCA Mobile, Livin Mandiri, dan seluruh aplikasi m-banking berlogo QRIS.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
