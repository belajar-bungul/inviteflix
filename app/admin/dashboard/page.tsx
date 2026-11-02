'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getAllInvitations, 
  saveInvitation, 
  deleteInvitation, 
  getDashboardStats, 
  resetToSeedData,
  deleteWish,
  togglePinWish
} from '@/lib/invitation-service';
import { subscribeToAuth, logoutAdmin } from '@/lib/auth-service';
import { 
  Invitation, 
  AdminUser, 
  DashboardStats, 
  EventType, 
  WishComment,
  ScheduleItem,
  StoryEpisode,
  GalleryMedia,
  DonationAccount
} from '@/lib/types';
import { 
  LayoutDashboard, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Settings, 
  MessageSquare, 
  LogOut, 
  RefreshCw, 
  Sparkles, 
  Search, 
  Film, 
  Calendar, 
  Gift, 
  Camera, 
  Pin,
  Save,
  X
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Data states
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'invitations' | 'moderation'>('invitations');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Editor Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(null);
  const [editorSubTab, setEditorSubTab] = useState<'basic' | 'features' | 'schedule' | 'story' | 'gallery' | 'donations'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Moderation state
  const [moderationWishes, setModerationWishes] = useState<WishComment[]>([]);
  const [moderationFilterInvId, setModerationFilterInvId] = useState<string>('all');

  // Verify auth session
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (!user) {
        router.push('/admin/login');
      }
    });
    return () => unsub();
  }, [router]);

  // Load invitations and stats
  const loadData = async () => {
    const invList = await getAllInvitations();
    setInvitations(invList);
    const dashStats = await getDashboardStats();
    setStats(dashStats);

    // Also collect all wishes for moderation
    try {
      if (typeof window !== 'undefined') {
        const rawWishes = localStorage.getItem('inviteflix_wishes_v1');
        if (rawWishes) {
          setModerationWishes(JSON.parse(rawWishes));
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    let isMounted = true;
    Promise.all([getAllInvitations(), getDashboardStats()]).then(([invList, dashStats]) => {
      if (!isMounted) return;
      setInvitations(invList);
      setStats(dashStats);
      if (typeof window !== 'undefined') {
        const rawWishes = localStorage.getItem('inviteflix_wishes_v1');
        if (rawWishes) {
          setModerationWishes(JSON.parse(rawWishes));
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Handle Logout
  const handleLogout = async () => {
    await logoutAdmin();
    router.push('/admin/login');
  };

  // Copy invitation public link
  const handleCopyLink = async (slug: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Toggle publish status
  const handleTogglePublish = async (inv: Invitation) => {
    const updated: Invitation = { ...inv, isPublished: !inv.isPublished };
    await saveInvitation(updated);
    await loadData();
  };

  // Delete invitation
  const handleDeleteInvitation = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus undangan "${title}"?`)) {
      await deleteInvitation(id);
      await loadData();
    }
  };

  // Create new blank invitation template
  const handleCreateNew = () => {
    const randomId = `inv-${Date.now().toString(36)}`;
    const blank: Invitation = {
      id: randomId,
      slug: `event-${Date.now().toString(36)}`,
      title: 'Judul Acara Baru',
      eventType: 'wedding',
      tagline: 'Season Premiere • Streaming Now',
      matchScore: 99,
      releaseYear: new Date().getFullYear(),
      maturityRating: 'ALL',
      eventDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      eventEndDate: new Date(Date.now() + 86400000 * 30 + 3600000 * 5).toISOString(),
      hosts: {
        primary: 'Nama Penyelenggara',
        secondary: '',
        parentsNote: 'Dengan penuh rasa syukur kami mengundang Anda untuk hadir di hari bahagia kami.',
      },
      venue: {
        name: 'Grand Ballroom',
        address: 'Jl. Jendral Sudirman No. 1, Jakarta Pusat',
        city: 'Jakarta',
        mapsUrl: 'https://maps.google.com',
        mapsEmbedUrl: '',
        directionsNote: 'Parkir gratis tersedia di lantai B1 dan B2.',
      },
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80',
      posterImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      synopsis: 'Deskripsi sinematik acara atau sinopsis kisah yang memukau tamu undangan.',
      genres: ['Romance', 'Celebration'],
      features: {
        introModal: true,
        countdown: true,
        details: true,
        story: true,
        gallery: true,
        donasi: true,
        guestbook: true,
        music: true,
        maps: true,
      },
      schedule: [
        {
          id: `sch-${Date.now()}-1`,
          title: 'Episode 1: Acara Utama',
          subtitle: 'Prosesi Inti',
          time: '10:00 - 12:00 WIB',
          location: 'Main Ballroom',
          description: 'Rangkaian acara khidmat bersama tamu undangan terhormat.',
          type: 'ceremony',
          episodeBadge: 'EPISODE 1',
        },
      ],
      episodes: [
        {
          id: `ep-${Date.now()}-1`,
          episodeNumber: 1,
          season: 1,
          title: 'Awal Pertemuan',
          year: '2022',
          description: 'Kilas balik kisah pertama kali berjumpa.',
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
        },
      ],
      gallery: [
        {
          id: `gal-${Date.now()}-1`,
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          caption: 'Production Still',
          type: 'photo',
        },
      ],
      donations: [
        {
          id: `don-${Date.now()}-1`,
          bankName: 'BCA',
          accountNumber: '1234567890',
          accountHolder: 'Nama Pemilik Rekening',
          notes: 'Amplop Digital',
        },
      ],
      isPublished: true,
      viewsCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setEditingInvitation(blank);
    setEditorSubTab('basic');
    setIsEditorOpen(true);
  };

  const handleEditInvitation = (inv: Invitation) => {
    // Clone deeply
    setEditingInvitation(JSON.parse(JSON.stringify(inv)));
    setEditorSubTab('basic');
    setIsEditorOpen(true);
  };

  const handleSaveEditor = async () => {
    if (!editingInvitation) return;
    setIsSaving(true);
    try {
      await saveInvitation(editingInvitation);
      await loadData();
      setIsEditorOpen(false);
      setEditingInvitation(null);
    } catch (err) {
      alert('Gagal menyimpan: ' + err);
    } finally {
      setIsSaving(false);
    }
  };

  // Moderation: Toggle Pin
  const handleToggleWishPin = async (wish: WishComment) => {
    await togglePinWish(wish.invitationId, wish.id, !wish.isPinned);
    await loadData();
  };

  // Moderation: Delete Wish
  const handleDeleteWish = async (wish: WishComment) => {
    if (confirm(`Hapus ucapan dari "${wish.name}"?`)) {
      await deleteWish(wish.invitationId, wish.id);
      await loadData();
    }
  };

  // Reset seed
  const handleResetData = () => {
    if (confirm('Reset ulang data demo ke kondisi awal (Alex & Sarah, TechCorp, Kevin)?')) {
      resetToSeedData();
      loadData();
    }
  };

  if (isLoadingAuth || !currentUser) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-neutral-400">
            MEMUAT DASHBOARD INVITEFLIX...
          </span>
        </div>
      </div>
    );
  }

  // Filtered invitations list
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch = 
      inv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.hosts.primary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || inv.eventType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#101010] text-white flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 bg-[#161616]/95 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#E50914] font-black tracking-widest text-2xl font-sans">
              INVITEFLIX
            </span>
            <span className="bg-neutral-800 text-[10px] uppercase font-bold text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
              Admin Portal
            </span>
          </Link>

          {/* Tab Selector */}
          <nav className="hidden sm:flex items-center gap-2 bg-[#1f1f1f] p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'invitations'
                  ? 'bg-[#E50914] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Daftar Undangan</span>
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'moderation'
                  ? 'bg-[#E50914] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Moderasi Ucapan (RSVP)</span>
            </button>
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetData}
            title="Reset ke Seed Data Awal"
            className="hidden md:flex items-center gap-1 text-xs text-neutral-400 hover:text-white bg-neutral-800/80 px-2.5 py-1.5 rounded border border-neutral-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-bold text-white leading-tight">
              {currentUser.displayName}
            </span>
            <span className="text-[10px] text-neutral-400">
              {currentUser.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 px-3 py-1.5 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards Banner */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 shadow">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Total Undangan
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalInvitations}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
                {stats.activeInvitations} Aktif Ditayangkan
              </span>
            </div>

            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 shadow">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Total Tayangan
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalViews.toLocaleString()}
              </div>
              <span className="text-[10px] text-neutral-400 font-semibold mt-1 block">
                Pengunjung Halaman
              </span>
            </div>

            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 shadow">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Total Ucapan
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stats.totalWishes}
              </div>
              <span className="text-[10px] text-neutral-400 font-semibold mt-1 block">
                Doa & Pesan Masuk
              </span>
            </div>

            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 shadow">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                RSVP Hadir
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {stats.rsvpBreakdown.hadir} Orang
              </div>
              <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">
                Terkonfirmasi Datang
              </span>
            </div>

            <div className="bg-[#181818] border border-neutral-800 rounded-xl p-4 shadow">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Tidak Hadir / Ragu
              </span>
              <div className="text-xl sm:text-2xl font-black text-neutral-300">
                {stats.rsvpBreakdown.tidak_hadir} / {stats.rsvpBreakdown.ragu}
              </div>
              <span className="text-[10px] text-neutral-400 font-semibold mt-1 block">
                Respon Alternatif
              </span>
            </div>
          </div>
        )}

        {/* TAB 1: INVITATIONS LIST */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul, slug, atau nama host..."
                    className="w-full bg-[#181818] border border-neutral-800 focus:border-[#E50914] rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[#181818] border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-neutral-300 focus:outline-none"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="corporate">Corporate</option>
                  <option value="product_launch">Product Launch</option>
                </select>
              </div>

              <button
                onClick={handleCreateNew}
                className="flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#B80710] text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-all shadow-md shadow-red-950/40 hover:scale-105 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Undangan Baru</span>
              </button>
            </div>

            {/* Invitations Grid / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-[#181818] border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Cover Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                      <img
                        src={inv.coverImage}
                        alt={inv.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/40" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="bg-[#E50914] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                          {inv.eventType}
                        </span>
                        <span className="bg-black/70 backdrop-blur-xs text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                          {inv.matchScore}% Match
                        </span>
                      </div>

                      {/* Status Toggle Switch */}
                      <div className="absolute top-2.5 right-2.5">
                        <button
                          onClick={() => handleTogglePublish(inv)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                            inv.isPublished
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {inv.isPublished ? '● Published' : '○ Draft'}
                        </button>
                      </div>

                      {/* Slug tag bottom */}
                      <div className="absolute bottom-2 left-2 text-[11px] font-mono text-neutral-300 bg-black/60 px-2 py-0.5 rounded">
                        /{inv.slug}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base font-bold text-white line-clamp-1 mb-1">
                        {inv.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mb-3 line-clamp-1">
                        Host: {inv.hosts.primary} {inv.hosts.secondary ? `& ${inv.hosts.secondary}` : ''}
                      </p>

                      {/* Active Feature Badges */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {inv.features.introModal && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Intro
                          </span>
                        )}
                        {inv.features.countdown && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Countdown
                          </span>
                        )}
                        {inv.features.details && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Schedule
                          </span>
                        )}
                        {inv.features.story && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Story
                          </span>
                        )}
                        {inv.features.gallery && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Gallery
                          </span>
                        )}
                        {inv.features.donasi && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Gift
                          </span>
                        )}
                        {inv.features.guestbook && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            RSVP
                          </span>
                        )}
                        {inv.features.music && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
                            Music
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="px-4 py-3 bg-[#141414] border-t border-neutral-800 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/${inv.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1.5 rounded transition-colors"
                        title="Buka Pratinjau Publik"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Lihat</span>
                      </Link>

                      <button
                        onClick={() => handleCopyLink(inv.slug)}
                        className="flex items-center gap-1 text-neutral-400 hover:text-white bg-neutral-800 px-2 py-1.5 rounded transition-colors"
                        title="Salin URL Publik"
                      >
                        {copiedSlug === inv.slug ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditInvitation(inv)}
                        className="flex items-center gap-1 bg-[#E50914] hover:bg-[#B80710] text-white font-bold px-3 py-1.5 rounded transition-colors shadow"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit & Toggles</span>
                      </button>

                      <button
                        onClick={() => handleDeleteInvitation(inv.id, inv.title)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Hapus Undangan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: GUESTBOOK & RSVP MODERATION */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Moderasi Buku Tamu & RSVP
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pin ucapan berkesan ke bagian teratas atau hapus pesan yang tidak pantas.
                </p>
              </div>

              <select
                value={moderationFilterInvId}
                onChange={(e) => setModerationFilterInvId(e.target.value)}
                className="bg-[#181818] border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-neutral-200 focus:outline-none"
              >
                <option value="all">Semua Undangan</option>
                {invitations.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Wishes Table / List */}
            <div className="bg-[#181818] border border-neutral-800 rounded-xl overflow-hidden shadow">
              <div className="divide-y divide-neutral-800">
                {moderationWishes
                  .filter(
                    (w) =>
                      moderationFilterInvId === 'all' ||
                      w.invitationId === moderationFilterInvId
                  )
                  .map((w) => {
                    const inv = invitations.find((i) => i.id === w.invitationId);
                    return (
                      <div
                        key={w.id}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          w.isPinned ? 'bg-amber-950/15' : 'hover:bg-neutral-800/40'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {w.name}
                            </span>
                            <span className="text-xs text-neutral-400">
                              ({w.relationship || 'Tamu'})
                            </span>

                            {w.attendance === 'hadir' && (
                              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                                Hadir ({w.pax} pax)
                              </span>
                            )}
                            {w.attendance === 'tidak_hadir' && (
                              <span className="text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                                Tidak Hadir
                              </span>
                            )}
                            {w.attendance === 'ragu' && (
                              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-bold">
                                Ragu-ragu
                              </span>
                            )}

                            {inv && (
                              <span className="text-[10px] text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded">
                                Event: {inv.title}
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                            {w.message}
                          </p>

                          <div className="text-[11px] text-neutral-500">
                            {new Date(w.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Moderation Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleWishPin(w)}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                              w.isPinned
                                ? 'bg-amber-500 text-black border-amber-400'
                                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                            <span>{w.isPinned ? 'Tersemat (Pinned)' : 'Sematkan'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteWish(w)}
                            className="p-2 text-neutral-400 hover:text-rose-400 bg-neutral-800 hover:bg-rose-950/40 rounded-lg border border-neutral-700 transition-colors"
                            title="Hapus Ucapan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FULL INVITATION BUILDER & FEATURE TOGGLE MODAL */}
      {isEditorOpen && editingInvitation && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#181818] border border-neutral-700 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1f1f1f] border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">
                  Invitation Studio & Feature Matrix
                </h3>
                <p className="text-xs text-neutral-400">
                  ID: <code className="text-[#E50914]">{editingInvitation.id}</code> • Slug: <code className="text-white">/{editingInvitation.slug}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEditor}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-[#E50914] hover:bg-[#B80710] disabled:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-all shadow hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-1 px-6 py-2.5 bg-[#141414] border-b border-neutral-800 overflow-x-auto no-scrollbar text-xs font-bold">
              {[
                { id: 'basic', label: '1. Info & Media', icon: Settings },
                { id: 'features', label: '2. Feature Toggles', icon: Sparkles },
                { id: 'schedule', label: '3. Rundown Acara', icon: Calendar },
                { id: 'story', label: '4. Kisah / Episodes', icon: Film },
                { id: 'gallery', label: '5. Galeri Foto', icon: Camera },
                { id: 'donations', label: '6. Amplop & QRIS', icon: Gift },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = editorSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEditorSubTab(tab.id as typeof editorSubTab)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#E50914] text-white shadow'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SUBTAB 1: BASIC INFO */}
              {editorSubTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Judul Undangan *
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.title}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Custom URL Slug (/[slug]) *
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.slug}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Tipe Acara (Event Type)
                      </label>
                      <select
                        value={editingInvitation.eventType}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            eventType: e.target.value as EventType,
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
                      >
                        <option value="wedding">Wedding (Pernikahan)</option>
                        <option value="birthday">Birthday (Ulang Tahun)</option>
                        <option value="corporate">Corporate Event</option>
                        <option value="product_launch">Product Launch</option>
                        <option value="graduation">Graduation</option>
                        <option value="anniversary">Anniversary</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Tagline Netflix (e.g. Season Finale)
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.tagline}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            tagline: e.target.value,
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Tanggal & Waktu Acara (ISO / Local)
                      </label>
                      <input
                        type="datetime-local"
                        value={
                          editingInvitation.eventDate
                            ? new Date(editingInvitation.eventDate).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            eventDate: new Date(e.target.value).toISOString(),
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Match Score % (Netflix Badge)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={editingInvitation.matchScore}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            matchScore: Number(e.target.value),
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>

                  {/* Hosts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-800">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Penyelenggara / Mempelai 1 *
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.hosts.primary}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            hosts: { ...editingInvitation.hosts, primary: e.target.value },
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Penyelenggara / Mempelai 2 (Opsional)
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.hosts.secondary || ''}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            hosts: { ...editingInvitation.hosts, secondary: e.target.value },
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-neutral-800">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Nama Gedung / Venue
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.venue.name}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            venue: { ...editingInvitation.venue, name: e.target.value },
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Alamat Lengkap
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.venue.address}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            venue: { ...editingInvitation.venue, address: e.target.value },
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Google Maps URL
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.venue.mapsUrl || ''}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            venue: { ...editingInvitation.venue, mapsUrl: e.target.value },
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Google Maps Embed URL (Iframe Src)
                      </label>
                      <input
                        type="text"
                        value={editingInvitation.venue.mapsEmbedUrl || ''}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            venue: { ...editingInvitation.venue, mapsEmbedUrl: e.target.value },
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Synopsis & Images */}
                  <div className="pt-3 border-t border-neutral-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                        Sinopsis Sinematik (Plot / Deskripsi Utama)
                      </label>
                      <textarea
                        rows={3}
                        value={editingInvitation.synopsis}
                        onChange={(e) =>
                          setEditingInvitation({
                            ...editingInvitation,
                            synopsis: e.target.value,
                          })
                        }
                        className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                          Cover Billboard Image URL (Landscape 16:9)
                        </label>
                        <input
                          type="text"
                          value={editingInvitation.coverImage}
                          onChange={(e) =>
                            setEditingInvitation({
                              ...editingInvitation,
                              coverImage: e.target.value,
                            })
                          }
                          className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                          Background Music URL (Direct MP3)
                        </label>
                        <input
                          type="text"
                          value={editingInvitation.bgMusicUrl || ''}
                          onChange={(e) =>
                            setEditingInvitation({
                              ...editingInvitation,
                              bgMusicUrl: e.target.value,
                            })
                          }
                          className="w-full bg-[#121212] border border-[#333333] rounded-lg p-2.5 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: FEATURE TOGGLES */}
              {editorSubTab === 'features' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 mb-6">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-[#E50914]" />
                      <span>Dynamic Feature Toggle Control (Per Invitation ID)</span>
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Aktifkan atau nonaktifkan modul secara independen untuk ID ini. Bagian yang dinonaktifkan tidak akan dirender pada halaman publik.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'introModal',
                        title: 'Intro Splash / "Who\'s Watching?"',
                        desc: 'Tampilkan modal profil pemilihan tamu ala Netflix dengan efek suara TUDUM saat dibuka.',
                      },
                      {
                        key: 'countdown',
                        title: 'Countdown Timer (Hitung Mundur)',
                        desc: 'Widget hitung mundur menuju tanggal premiere acara.',
                      },
                      {
                        key: 'details',
                        title: 'Rundown & Schedule (Episodes Guide)',
                        desc: 'Daftar jadwal acara berurutan layaknya panduan episode Netflix.',
                      },
                      {
                        key: 'story',
                        title: 'Kisah Kami / Timeline Carousel',
                        desc: 'Carousel horizontal kisah cinta/sejarah acara dengan kartu hover-zoom.',
                      },
                      {
                        key: 'gallery',
                        title: 'Galeri Foto & Video (Trailers & Stills)',
                        desc: 'Grid foto sinematik dengan modal lightbox dan filter kategori.',
                      },
                      {
                        key: 'donasi',
                        title: 'Amplop Digital / Gift Voucher',
                        desc: 'Kartu hadiah transfer bank, nomor rekening, dan scan QRIS digital.',
                      },
                      {
                        key: 'guestbook',
                        title: 'Live Guestbook & RSVP Feed',
                        desc: 'Ulasan tamu dan konfirmasi kehadiran real-time tersinkronisasi.',
                      },
                      {
                        key: 'music',
                        title: 'Audio Soundtrack & Player',
                        desc: 'Pemutar audio latar belakang dengan tombol mute/unmute mengambang.',
                      },
                      {
                        key: 'maps',
                        title: 'Google Maps Embed',
                        desc: 'Tampilkan peta interaktif pada kartu lokasi venue.',
                      },
                    ].map((feature) => {
                      const isEnabled = editingInvitation.features[feature.key as keyof typeof editingInvitation.features];
                      return (
                        <div
                          key={feature.key}
                          onClick={() => {
                            setEditingInvitation({
                              ...editingInvitation,
                              features: {
                                ...editingInvitation.features,
                                [feature.key]: !isEnabled,
                              },
                            });
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 select-none ${
                            isEnabled
                              ? 'bg-[#1e1b1b] border-[#E50914]/80 shadow-[0_0_15px_rgba(229,9,20,0.15)]'
                              : 'bg-[#141414] border-neutral-800 opacity-60 hover:opacity-80'
                          }`}
                        >
                          <div className="flex-1">
                            <span className="text-sm font-bold text-white block">
                              {feature.title}
                            </span>
                            <span className="text-xs text-neutral-400 mt-1 block leading-relaxed">
                              {feature.desc}
                            </span>
                          </div>

                          <div
                            className={`w-11 h-6 rounded-full p-1 transition-colors relative shrink-0 ${
                              isEnabled ? 'bg-[#E50914]' : 'bg-neutral-800'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: SCHEDULE */}
              {editorSubTab === 'schedule' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Rundown Acara ({editingInvitation.schedule.length} Item)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newSch: ScheduleItem = {
                          id: `sch-${Date.now()}`,
                          title: 'Episode Baru',
                          subtitle: 'Sub-judul Acara',
                          time: '19:00 - 21:00 WIB',
                          location: editingInvitation.venue.name,
                          description: 'Deskripsi singkat sesi acara...',
                          type: 'ceremony',
                          episodeBadge: `EP ${editingInvitation.schedule.length + 1}`,
                        };
                        setEditingInvitation({
                          ...editingInvitation,
                          schedule: [...editingInvitation.schedule, newSch],
                        });
                      }}
                      className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg border border-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Sesi</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingInvitation.schedule.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-[#121212] border border-neutral-800 p-4 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#E50914]">
                            Episode #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingInvitation.schedule.filter(
                                (_, i) => i !== idx
                              );
                              setEditingInvitation({
                                ...editingInvitation,
                                schedule: updated,
                              });
                            }}
                            className="text-xs text-rose-400 hover:text-white"
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Judul Acara"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...editingInvitation.schedule];
                              updated[idx].title = e.target.value;
                              setEditingInvitation({
                                ...editingInvitation,
                                schedule: updated,
                              });
                            }}
                            className="bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Waktu (e.g. 10:00 - 12:00 WIB)"
                            value={item.time}
                            onChange={(e) => {
                              const updated = [...editingInvitation.schedule];
                              updated[idx].time = e.target.value;
                              setEditingInvitation({
                                ...editingInvitation,
                                schedule: updated,
                              });
                            }}
                            className="bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Badge (e.g. EPISODE 1)"
                            value={item.episodeBadge || ''}
                            onChange={(e) => {
                              const updated = [...editingInvitation.schedule];
                              updated[idx].episodeBadge = e.target.value;
                              setEditingInvitation({
                                ...editingInvitation,
                                schedule: updated,
                              });
                            }}
                            className="bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                          />
                        </div>

                        <textarea
                          placeholder="Deskripsi Acara"
                          rows={2}
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...editingInvitation.schedule];
                            updated[idx].description = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              schedule: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 4: STORY */}
              {editorSubTab === 'story' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Story Chapters / Episodes ({editingInvitation.episodes.length} Bab)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newEp: StoryEpisode = {
                          id: `ep-${Date.now()}`,
                          episodeNumber: editingInvitation.episodes.length + 1,
                          title: 'Bab Baru',
                          year: '2024',
                          description: 'Ceritakan momen istimewa ini...',
                          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=80',
                        };
                        setEditingInvitation({
                          ...editingInvitation,
                          episodes: [...editingInvitation.episodes, newEp],
                        });
                      }}
                      className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg border border-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Bab Cerita</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingInvitation.episodes.map((ep, idx) => (
                      <div
                        key={ep.id || idx}
                        className="bg-[#121212] border border-neutral-800 p-4 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#E50914]">
                            Bab #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingInvitation.episodes.filter(
                                (_, i) => i !== idx
                              );
                              setEditingInvitation({
                                ...editingInvitation,
                                episodes: updated,
                              });
                            }}
                            className="text-xs text-rose-400 hover:text-white"
                          >
                            Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Judul Bab"
                            value={ep.title}
                            onChange={(e) => {
                              const updated = [...editingInvitation.episodes];
                              updated[idx].title = e.target.value;
                              setEditingInvitation({
                                ...editingInvitation,
                                episodes: updated,
                              });
                            }}
                            className="bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Tahun / Momen (e.g. 2021)"
                            value={ep.year || ''}
                            onChange={(e) => {
                              const updated = [...editingInvitation.episodes];
                              updated[idx].year = e.target.value;
                              setEditingInvitation({
                                ...editingInvitation,
                                episodes: updated,
                              });
                            }}
                            className="bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            value={ep.imageUrl}
                            onChange={(e) => {
                              const updated = [...editingInvitation.episodes];
                              updated[idx].imageUrl = e.target.value;
                              setEditingInvitation({
                                ...editingInvitation,
                                episodes: updated,
                              });
                            }}
                            className="bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                          />
                        </div>

                        <textarea
                          placeholder="Deskripsi cerita..."
                          rows={2}
                          value={ep.description}
                          onChange={(e) => {
                            const updated = [...editingInvitation.episodes];
                            updated[idx].description = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              episodes: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 5: GALLERY */}
              {editorSubTab === 'gallery' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Media Galeri ({editingInvitation.gallery.length} Foto)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newGal: GalleryMedia = {
                          id: `gal-${Date.now()}`,
                          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
                          caption: 'Foto Galeri Baru',
                          type: 'photo',
                          category: 'Highlights',
                        };
                        setEditingInvitation({
                          ...editingInvitation,
                          gallery: [...editingInvitation.gallery, newGal],
                        });
                      }}
                      className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg border border-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Foto</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editingInvitation.gallery.map((g, idx) => (
                      <div
                        key={g.id || idx}
                        className="bg-[#121212] border border-neutral-800 p-3 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-400">
                            Foto #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingInvitation.gallery.filter(
                                (_, i) => i !== idx
                              );
                              setEditingInvitation({
                                ...editingInvitation,
                                gallery: updated,
                              });
                            }}
                            className="text-xs text-rose-400 hover:text-white"
                          >
                            Hapus
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Image URL"
                          value={g.url}
                          onChange={(e) => {
                            const updated = [...editingInvitation.gallery];
                            updated[idx].url = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              gallery: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Caption Foto"
                          value={g.caption}
                          onChange={(e) => {
                            const updated = [...editingInvitation.gallery];
                            updated[idx].caption = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              gallery: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 6: DONATIONS / GIFTS */}
              {editorSubTab === 'donations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Rekening Bank & QRIS ({editingInvitation.donations.length} Akun)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newDon: DonationAccount = {
                          id: `don-${Date.now()}`,
                          bankName: 'Bank Central Asia (BCA)',
                          accountNumber: '8830192837',
                          accountHolder: editingInvitation.hosts.primary,
                          notes: 'Amplop Digital Wedding Gift',
                        };
                        setEditingInvitation({
                          ...editingInvitation,
                          donations: [...editingInvitation.donations, newDon],
                        });
                      }}
                      className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg border border-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Rekening</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editingInvitation.donations.map((d, idx) => (
                      <div
                        key={d.id || idx}
                        className="bg-[#121212] border border-neutral-800 p-4 rounded-xl space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-300">
                            Rekening #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingInvitation.donations.filter(
                                (_, i) => i !== idx
                              );
                              setEditingInvitation({
                                ...editingInvitation,
                                donations: updated,
                              });
                            }}
                            className="text-xs text-rose-400 hover:text-white"
                          >
                            Hapus
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Nama Bank (e.g. Bank Central Asia / BCA)"
                          value={d.bankName}
                          onChange={(e) => {
                            const updated = [...editingInvitation.donations];
                            updated[idx].bankName = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              donations: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />

                        <input
                          type="text"
                          placeholder="Nomor Rekening"
                          value={d.accountNumber}
                          onChange={(e) => {
                            const updated = [...editingInvitation.donations];
                            updated[idx].accountNumber = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              donations: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white font-mono"
                        />

                        <input
                          type="text"
                          placeholder="Atas Nama Pemilik Rekening"
                          value={d.accountHolder}
                          onChange={(e) => {
                            const updated = [...editingInvitation.donations];
                            updated[idx].accountHolder = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              donations: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />

                        <input
                          type="text"
                          placeholder="QRIS Image URL (Opsional)"
                          value={d.qrisImageUrl || ''}
                          onChange={(e) => {
                            const updated = [...editingInvitation.donations];
                            updated[idx].qrisImageUrl = e.target.value;
                            setEditingInvitation({
                              ...editingInvitation,
                              donations: updated,
                            });
                          }}
                          className="w-full bg-[#1a1a1a] border border-neutral-800 rounded p-2 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
