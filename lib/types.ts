export type EventType = 
  | 'wedding' 
  | 'birthday' 
  | 'corporate' 
  | 'product_launch' 
  | 'graduation' 
  | 'anniversary';

export type AttendanceStatus = 'hadir' | 'tidak_hadir' | 'ragu';

export interface FeatureToggles {
  introModal: boolean;     // "Who's Watching?" splash / profile screen
  countdown: boolean;      // Season premiere countdown
  details: boolean;        // Schedule / Episode Rundown
  story: boolean;          // Our Story / Timeline carousel
  gallery: boolean;        // Production stills / Photo & video gallery
  donasi: boolean;         // Digital envelope / Netflix Gift Card & QRIS
  guestbook: boolean;      // Live wishes & RSVP feed
  music: boolean;          // Ambient background music & TUDUM sound
  maps: boolean;           // Google Maps interactive embed
}

export interface VenueInfo {
  name: string;
  address: string;
  city: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
  directionsNote?: string;
}

export interface HostInfo {
  primary: string;           // e.g. "Sarah Jenkins" or "TechCorp Inc."
  secondary?: string;         // e.g. "Alexander Vance"
  primaryTitle?: string;      // e.g. "Putri dari Bpk. Handoko & Ibu Ratna"
  secondaryTitle?: string;    // e.g. "Putra dari Bpk. Santoso & Ibu Linda"
  parentsNote?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  subtitle?: string;
  time: string;              // e.g. "09:00 - 11:00 WIB"
  duration?: string;         // e.g. "120m"
  location: string;
  description: string;
  type: 'ceremony' | 'reception' | 'party' | 'keynote' | 'dinner' | 'other';
  episodeBadge?: string;     // e.g. "EP 1", "MAIN EVENT"
}

export interface StoryEpisode {
  id: string;
  episodeNumber: number;
  season?: number;
  title: string;
  year?: string;
  duration?: string;
  description: string;
  imageUrl: string;
}

export interface GalleryMedia {
  id: string;
  url: string;
  caption: string;
  type: 'photo' | 'video';
  category?: string;         // e.g. "Behind the Scenes", "Pre-wedding", "Trailer"
}

export interface DonationAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisImageUrl?: string;
  logoUrl?: string;
  notes?: string;
}

export interface WishComment {
  id: string;
  invitationId: string;
  name: string;
  relationship?: string;     // e.g. "Sahabat / Friend", "Keluarga / Family", "Rekan Kerja / Colleague"
  attendance: AttendanceStatus;
  pax: number;
  message: string;
  isPinned: boolean;
  createdAt: number;
  avatarIndex?: number;
}

export interface Invitation {
  id: string;
  slug: string;
  title: string;
  eventType: EventType;
  tagline: string;
  matchScore: number;         // e.g. 98, 99 ("99% Match")
  releaseYear: number;
  maturityRating: string;     // e.g. "13+", "ALL", "18+", "VIP"
  eventDate: string;          // ISO string or formatted date
  eventEndDate?: string;
  venue: VenueInfo;
  hosts: HostInfo;
  coverImage: string;         // Billboard landscape hero image
  posterImage: string;        // Vertical 3:4 or 2:3 movie poster
  synopsis: string;
  trailerVideoUrl?: string;   // Video trailer embed or direct video
  bgMusicUrl?: string;
  genres: string[];           // e.g. ["Romantic", "True Story", "Drama", "Celebration"]
  features: FeatureToggles;
  schedule: ScheduleItem[];
  episodes: StoryEpisode[];
  gallery: GalleryMedia[];
  donations: DonationAccount[];
  isPublished: boolean;
  viewsCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'owner';
}

export interface DashboardStats {
  totalInvitations: number;
  activeInvitations: number;
  totalViews: number;
  totalWishes: number;
  totalRsvpConfirmed: number;
  rsvpBreakdown: {
    hadir: number;
    tidak_hadir: number;
    ragu: number;
  };
}

