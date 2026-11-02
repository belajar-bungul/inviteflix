import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getInvitationBySlug, getStaticInitialSlugs } from '@/lib/invitation-service';
import InvitationClientViewer from './invitation-client-viewer';

export async function generateStaticParams() {
  const invitations = await getStaticInitialSlugs();
  return invitations.map((slug) => ({
    slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    return {
      title: 'Undangan Tidak Ditemukan - INVITEFLIX',
      description: 'Undangan yang Anda cari tidak tersedia atau belum dipublikasikan.',
    };
  }

  return {
    title: `${invitation.title} | INVITEFLIX Exclusive`,
    description: invitation.synopsis,
    openGraph: {
      title: invitation.title,
      description: invitation.synopsis,
      images: [
        {
          url: invitation.posterImage || invitation.coverImage,
          width: 800,
          height: 1200,
          alt: invitation.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: invitation.title,
      description: invitation.synopsis,
      images: [invitation.coverImage],
    },
  };
}

export default async function InvitationPage({ params }: PageProps) {
  const { slug } = await params;

  const invitation = await getInvitationBySlug(slug);

  if (!invitation) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <InvitationClientViewer
        initialInvitation={invitation}
      />
    </Suspense>
  );
}
