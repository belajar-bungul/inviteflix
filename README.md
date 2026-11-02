# INVITEFLIX — Multi-Tenant Digital Invitation Platform (Netflix Theme)

> **SaaS-Style Digital Invitation Platform** inspired by the authentic **Netflix UI/UX design system** (Cinematic Dark Mode `#141414`, Bold Red `#E50914` accents, horizontal carousels with card-hover zoom, "Who's Watching?" profile splash, synthetic Web Audio API "TUDUM" sound hit, and real-time Cloud Firestore guestbook/RSVP).

---

## 🌟 Key Architecture & Highlights

1. **Multi-Tenant & Multi-Event Scalability:**
   - Unified Firestore data schema capable of supporting Weddings, Birthdays, Corporate Keynotes, Product Launches, and Graduations under unique URL slugs (`/[slug]`).
2. **Dynamic Per-Invitation Feature Toggles:**
   - Every invitation ID has independent boolean toggles:
     - `introModal`: Cinematic "Who's Watching?" profile selector splash
     - `countdown`: Season premiere release countdown timer
     - `details`: Episode guide & venue schedule with Google Maps embed
     - `story`: Horizontal scrolling story chapters carousel
     - `gallery`: Production stills & video teaser lightbox
     - `donasi`: Netflix Gift Card styled digital envelopes & QRIS modal
     - `guestbook`: Real-time audience comments & RSVP stream
     - `music`: Floating ambient soundtrack player with audio equalizer
     - `maps`: Interactive venue map embed toggle
3. **Decoupled Security & Admin Routing:**
   - Admin routes (`/admin/login`, `/admin/dashboard`) are decoupled from public invitation routes (`/[slug]`).
   - Built-in session security with Firebase Authentication and an instant Zero-Friction Demo Mode (`admin@inviteflix.com` / `netflix2025`).
4. **Real-time Firestore Guestbook & Confetti RSVP:**
   - Real-time updates with `onSnapshot` / local reactive emitter.
   - Moderation tools: Pin favorite wishes to top, delete inappropriate comments.
   - Interactive celebratory confetti explosion upon RSVP submission.
5. **No Broken Audio Links:**
   - Synthesizes the authentic Netflix "TUDUM" two-strike chord using standard Web Audio API (D-major sub-bass + pad swell), playing natively without external MP3 asset failures.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 🔑 Demo Access & Test Links

- **Platform Homepage:** `http://localhost:3000/`
- **Pre-seeded Public Invitations:**
  - 💍 **Wedding Premiere:** `http://localhost:3000/alex-sarah-wedding`
  - 💌 **Personalized VIP Guest:** `http://localhost:3000/alex-sarah-wedding?to=Budi+Santoso`
  - 🚀 **Corporate Product Launch:** `http://localhost:3000/techcorp-nexus-2025`
  - 🎂 **Birthday Level 30:** `http://localhost:3000/kevin-turns-30`
- **Admin Gateway:** `http://localhost:3000/admin/login`
  - **Email:** `admin@inviteflix.com`
  - **Password:** `netflix2025`
  - *(or click the "Gunakan Akun Demo" 1-click button)*
- **Admin Dashboard:** `http://localhost:3000/admin/dashboard`

---

## 📂 Project Structure

```text
inviteflix/
├── app/
│   ├── [slug]/                     # Public Dynamic Invitation Viewer
│   │   ├── page.tsx                # Metadata & Static / SSR resolver
│   │   └── invitation-client-viewer.tsx # Dynamic feature toggle renderer
│   ├── admin/
│   │   ├── login/page.tsx          # Netflix-styled Admin Sign-in
│   │   └── dashboard/page.tsx      # Metrics, Studio Builder & Moderation
│   ├── globals.css                 # Netflix Dark Theme & custom scrollbars
│   ├── layout.tsx                  # Global root layout
│   └── page.tsx                    # Platform landing showcase
├── components/
│   ├── navbar.tsx                  # Netflix frosted header & sound toggle
│   ├── whos-watching-modal.tsx     # "Who's Watching?" profile selector + TUDUM
│   ├── hero-banner.tsx             # Billboard hero with match score & .ics generator
│   ├── countdown-timer.tsx         # Season premiere countdown timer
│   ├── event-schedule.tsx          # Episode guide & venue directions
│   ├── story-timeline.tsx          # Horizontal carousel with card hover-zoom
│   ├── gallery-lightbox.tsx        # Production stills grid & fullscreen lightbox
│   ├── donation-registry.tsx       # Digital gift cards & QRIS modal
│   ├── guestbook-rsvp.tsx          # Real-time wishes feed & confetti RSVP
│   └── audio-controller.tsx        # Floating music player with animated equalizer
├── lib/
│   ├── types.ts                    # TypeScript schemas (Invitation, Wishes, Stats)
│   ├── firebase.ts                 # Firebase app, auth & firestore initialization
│   ├── auth-service.ts             # Auth session & demo admin fallback
│   ├── invitation-service.ts       # Firestore & Reactive Store abstraction
│   ├── tudum-sound.ts              # Web Audio API Netflix TUDUM synthesis
│   └── mock-data.ts                # Rich seed invitations & wishes
├── firestore.rules                 # Cloud Firestore Security Rules
└── .env.example                    # Firebase configuration template
```

---

## 🗄️ Firestore Database Schema Design

### 1. `invitations` Collection
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique document ID (e.g. `inv-alex-sarah-2025`) |
| `slug` | `string` | Custom URL slug index (e.g. `alex-sarah-wedding`) |
| `title` | `string` | Event title (e.g. "The Wedding: Sarah & Alexander") |
| `eventType` | `string` | `'wedding' \| 'birthday' \| 'corporate' \| 'product_launch'` |
| `tagline` | `string` | Netflix-style subtitle (e.g. "Season Finale • In 4K Ultra HD") |
| `matchScore` | `number` | Netflix recommendation score (e.g. `99`) |
| `eventDate` | `string` | ISO 8601 target event date & time |
| `features` | `map` | Boolean map for dynamic section toggles |
| `venue` | `map` | Venue name, address, Google Maps links, and directions |
| `hosts` | `map` | Primary and secondary host names, title notes |
| `schedule` | `array<map>` | Rundown items styled as Netflix episodes |
| `episodes` | `array<map>` | Story milestones with thumbnails & descriptions |
| `gallery` | `array<map>` | Photo & video media URLs and captions |
| `donations`| `array<map>` | Bank accounts, account holders, and QRIS images |
| `isPublished`| `boolean`| Status switch to control public availability |
| `viewsCount` | `number` | Page view counter |

### 2. `invitations/{invitationId}/wishes` Subcollection
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique wish document ID |
| `invitationId`| `string` | Parent invitation ID reference |
| `name` | `string` | Guest or attendee name |
| `relationship`| `string` | Relationship tag (e.g. "Sahabat / Friend") |
| `attendance` | `string` | `'hadir' \| 'tidak_hadir' \| 'ragu'` |
| `pax` | `number` | Confirmed guest count |
| `message` | `string` | Heartfelt message or greeting |
| `isPinned` | `boolean`| Pinned to top of audience feed by Admin |
| `createdAt` | `number` | Timestamp in milliseconds |
