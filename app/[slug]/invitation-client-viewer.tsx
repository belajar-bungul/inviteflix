'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Invitation } from '@/lib/types';
import { incrementInvitationViews } from '@/lib/invitation-service';
import NetflixNavbar from '@/components/navbar';
import WhosWatchingModal from '@/components/whos-watching-modal';
import HeroBanner from '@/components/hero-banner';
import CountdownTimer from '@/components/countdown-timer';
import EventSchedule from '@/components/event-schedule';
import StoryTimeline from '@/components/story-timeline';
import GalleryLightbox from '@/components/gallery-lightbox';
import DonationRegistry from '@/components/donation-registry';
import GuestbookRsvp from '@/components/guestbook-rsvp';
import AudioController from '@/components/audio-controller';
import { ShieldCheck } from 'lucide-react';

interface InvitationClientViewerProps {
  initialInvitation: Invitation;
  guestName?: string;
}

export default function InvitationClientViewer({
  initialInvitation,
  guestName: propGuestName,
}: InvitationClientViewerProps) {
  const searchParams = useSearchParams();
  const guestName = searchParams.get('to') || propGuestName;

  const [invitation] = useState<Invitation>(initialInvitation);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(
    Boolean(initialInvitation.features.introModal)
  );
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Increment view counter once on mount
  useEffect(() => {
    incrementInvitationViews(invitation.id);
  }, [invitation.id]);

  const handleEnterInvitation = () => {
    setIsIntroModalOpen(false);
    if (invitation.features.music) {
      setIsAudioPlaying(true);
    }
  };

  const handleToggleAudio = () => {
    setIsAudioPlaying((prev) => !prev);
  };

  const { features } = invitation;

  return (
    <main className="min-h-screen bg-[#141414] text-white selection:bg-[#E50914] selection:text-white relative">
      {/* 1. Who's Watching / Splash Screen Modal */}
      {features.introModal && (
        <WhosWatchingModal
          isOpen={isIntroModalOpen}
          onEnter={handleEnterInvitation}
          guestName={guestName}
          eventTitle={invitation.title}
          hosts={invitation.hosts}
        />
      )}

      {/* Floating Navigation Header */}
      <NetflixNavbar
        title={invitation.title}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
        hasMusicFeature={features.music}
        guestName={guestName}
      />

      {/* 2. Hero Billboard Banner (Always Core) */}
      <HeroBanner
        invitation={invitation}
        guestName={guestName}
        onOpenPlay={() => {
          if (features.music && !isAudioPlaying) {
            setIsAudioPlaying(true);
          }
        }}
      />

      {/* 3. Countdown Section (Feature Toggle: countdown) */}
      {features.countdown && (
        <CountdownTimer
          targetDate={invitation.eventDate}
          title="Episode Premiere Countdown"
          venueCity={invitation.venue.city}
        />
      )}

      {/* 4. Event Details & Schedule (Feature Toggle: details) */}
      {features.details && (
        <EventSchedule
          schedule={invitation.schedule}
          venue={invitation.venue}
          hostsNote={invitation.hosts.parentsNote}
          showMaps={features.maps}
        />
      )}

      {/* 5. Our Story / Episodes Carousel (Feature Toggle: story) */}
      {features.story && (
        <StoryTimeline
          episodes={invitation.episodes}
          title="Kisah Kami (Story Arc)"
          subtitle={`The Journey of ${invitation.hosts.primary} ${invitation.hosts.secondary ? `& ${invitation.hosts.secondary}` : ''}`}
        />
      )}

      {/* 6. Gallery / Production Stills (Feature Toggle: gallery) */}
      {features.gallery && (
        <GalleryLightbox
          gallery={invitation.gallery}
          title="Galeri Cuplikan (Trailers & Stills)"
          subtitle="Behind-The-Scenes & Moments"
        />
      )}

      {/* 7. Gift Registry / Digital Envelope (Feature Toggle: donasi) */}
      {features.donasi && (
        <DonationRegistry
          donations={invitation.donations}
          title="Amplop Digital & Gift Voucher"
          subtitle="Tanda Kasih & Hadiah Pernikahan"
        />
      )}

      {/* 8. Real-time Guestbook & RSVP (Feature Toggle: guestbook) */}
      {features.guestbook && (
        <GuestbookRsvp
          invitationId={invitation.id}
          guestName={guestName}
          title="Reviews & Konfirmasi Kehadiran (RSVP)"
          subtitle="Tinggalkan pesan, ucapan selamat, dan konfirmasi jumlah kehadiran Anda"
        />
      )}

      {/* 9. Floating Background Audio Player (Feature Toggle: music) */}
      {features.music && (
        <AudioController
          musicUrl={invitation.bgMusicUrl}
          isPlaying={isAudioPlaying}
          onToggle={handleToggleAudio}
          trackTitle={invitation.title}
        />
      )}

      {/* Netflix Footer */}
      <footer className="mt-20 border-t border-[#262626] bg-[#0f0f0f] py-12 px-4 sm:px-6 lg:px-8 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-[#E50914] font-black tracking-widest text-xl">
              INVITEFLIX
            </span>
            <p className="text-neutral-500 text-[11px]">
              SaaS Multi-Tenant Digital Invitation Platform • Netflix UI Edition
            </p>
          </div>

          <div className="flex items-center gap-6 text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda Platform
            </Link>
            <Link href="/admin/login" className="hover:text-white transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span>Admin Portal</span>
            </Link>
          </div>

          <div className="text-neutral-500 text-[11px] text-center md:text-right">
            © 2025 {invitation.title}. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
