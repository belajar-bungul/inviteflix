import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  increment 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Invitation, WishComment, DashboardStats } from './types';
import { INITIAL_INVITATIONS, INITIAL_WISHES } from './mock-data';

// Local storage keys for mock/fallback mode
const STORAGE_KEY_INVITATIONS = 'inviteflix_invitations_v1';
const STORAGE_KEY_WISHES = 'inviteflix_wishes_v1';

// Custom Event target for mock real-time subscription
class RealtimeEmitter extends EventTarget {
  notify(type: string, data?: unknown) {
    this.dispatchEvent(new CustomEvent(type, { detail: data }));
  }
}
const realtimeEmitter = new RealtimeEmitter();

export function getStaticInitialSlugs(): string[] {
  return INITIAL_INVITATIONS.map(i => i.slug);
}

/**
 * Retrieve local stored invitations or initialize with seed
 */
function getLocalInvitations(): Invitation[] {
  if (typeof window === 'undefined') return INITIAL_INVITATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_INVITATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(INITIAL_INVITATIONS));
      return INITIAL_INVITATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INVITATIONS;
  }
}

function saveLocalInvitations(invitations: Invitation[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(invitations));
    realtimeEmitter.notify('invitations_updated');
  } catch (e) {
    console.error('Failed to save invitations locally', e);
  }
}

function getLocalWishes(): WishComment[] {
  if (typeof window === 'undefined') return INITIAL_WISHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WISHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(INITIAL_WISHES));
      return INITIAL_WISHES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WISHES;
  }
}

function saveLocalWishes(wishes: WishComment[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(wishes));
    realtimeEmitter.notify('wishes_updated');
  } catch (e) {
    console.error('Failed to save wishes locally', e);
  }
}

/**
 * Fetch all invitations (Admin / Listing)
 */
export async function getAllInvitations(): Promise<Invitation[]> {
  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'invitations');
      const snap = await getDocs(colRef);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as Invitation));
      }
    } catch (err) {
      console.warn('Firestore fetch failed, falling back to local store:', err);
    }
  }
  return getLocalInvitations();
}

/**
 * Fetch single invitation by its unique URL slug
 */
export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  const cleanSlug = slug.toLowerCase().trim();

  if (isFirebaseConfigured && db) {
    try {
      const colRef = collection(db, 'invitations');
      const q = query(colRef, where('slug', '==', cleanSlug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { ...d.data(), id: d.id } as Invitation;
      }
    } catch (err) {
      console.warn('Firestore slug query failed, falling back to local store:', err);
    }
  }

  const all = getLocalInvitations();
  return all.find(inv => inv.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Fetch invitation by Document ID
 */
export async function getInvitationById(id: string): Promise<Invitation | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'invitations', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Invitation;
      }
    } catch (err) {
      console.warn('Firestore getDoc failed:', err);
    }
  }

  const all = getLocalInvitations();
  return all.find(inv => inv.id === id) || null;
}

/**
 * Create or Update an invitation
 */
export async function saveInvitation(invitation: Invitation): Promise<void> {
  const updatedData: Invitation = {
    ...invitation,
    updatedAt: Date.now(),
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'invitations', invitation.id);
      await setDoc(docRef, updatedData, { merge: true });
    } catch (err) {
      console.warn('Firestore saveInvitation failed:', err);
    }
  }

  // Always sync local store as well
  const all = getLocalInvitations();
  const index = all.findIndex(i => i.id === invitation.id);
  if (index >= 0) {
    all[index] = updatedData;
  } else {
    all.unshift(updatedData);
  }
  saveLocalInvitations(all);
}

/**
 * Delete an invitation
 */
export async function deleteInvitation(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'invitations', id));
    } catch (err) {
      console.warn('Firestore deleteDoc failed:', err);
    }
  }

  const all = getLocalInvitations().filter(i => i.id !== id);
  saveLocalInvitations(all);
}

/**
 * Increment page view count
 */
export async function incrementInvitationViews(id: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'invitations', id);
      await updateDoc(docRef, { viewsCount: increment(1) });
    } catch {
      // ignore
    }
  }

  const all = getLocalInvitations();
  const inv = all.find(i => i.id === id);
  if (inv) {
    inv.viewsCount = (inv.viewsCount || 0) + 1;
    saveLocalInvitations(all);
  }
}

/**
 * Real-time listener for Wishes / Guestbook
 */
export function subscribeToWishes(
  invitationId: string, 
  callback: (wishes: WishComment[]) => void
): () => void {
  if (isFirebaseConfigured && db) {
    try {
      const wishesCol = collection(db, 'invitations', invitationId, 'wishes');
      const q = query(wishesCol, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const result: WishComment[] = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id,
        } as WishComment));

        // Sort: pinned first, then newest
        result.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.createdAt - a.createdAt;
        });

        callback(result);
      }, (error) => {
        console.warn('Firestore snapshot error, falling back to local:', error);
        loadLocalWishes();
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribe error:', err);
    }
  }

  // Local fallback subscription
  const loadLocalWishes = () => {
    const all = getLocalWishes().filter(w => w.invitationId === invitationId);
    all.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt - a.createdAt;
    });
    callback(all);
  };

  loadLocalWishes();

  const handleUpdate = () => loadLocalWishes();
  realtimeEmitter.addEventListener('wishes_updated', handleUpdate);

  return () => {
    realtimeEmitter.removeEventListener('wishes_updated', handleUpdate);
  };
}

/**
 * Add a new wish / RSVP entry
 */
export async function addWishComment(wish: Omit<WishComment, 'id' | 'createdAt'> | Omit<WishComment, 'id' | 'createdAt' | 'isPinned'>): Promise<WishComment> {
  const newWish: WishComment = {
    ...wish,
    id: `wish-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
    isPinned: 'isPinned' in wish ? Boolean(wish.isPinned) : false,
    avatarIndex: wish.avatarIndex ?? Math.floor(Math.random() * 5),
  };

  if (isFirebaseConfigured && db) {
    try {
      const wishesDoc = doc(db, 'invitations', wish.invitationId, 'wishes', newWish.id);
      await setDoc(wishesDoc, newWish);
    } catch (err) {
      console.warn('Firestore addWish failed:', err);
    }
  }

  const all = getLocalWishes();
  all.unshift(newWish);
  saveLocalWishes(all);

  return newWish;
}

/**
 * Toggle pinned status for a wish (Admin Moderation)
 */
export async function togglePinWish(invitationId: string, wishId: string, isPinned: boolean): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const wishRef = doc(db, 'invitations', invitationId, 'wishes', wishId);
      await updateDoc(wishRef, { isPinned });
    } catch (err) {
      console.warn('Firestore togglePinWish failed:', err);
    }
  }

  const all = getLocalWishes();
  const item = all.find(w => w.id === wishId);
  if (item) {
    item.isPinned = isPinned;
    saveLocalWishes(all);
  }
}

/**
 * Delete a wish (Admin Moderation)
 */
export async function deleteWish(invitationId: string, wishId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      const wishRef = doc(db, 'invitations', invitationId, 'wishes', wishId);
      await deleteDoc(wishRef);
    } catch (err) {
      console.warn('Firestore deleteWish failed:', err);
    }
  }

  const all = getLocalWishes().filter(w => w.id !== wishId);
  saveLocalWishes(all);
}

/**
 * Calculate system stats for Admin Dashboard
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const invitations = await getAllInvitations();
  const wishes = getLocalWishes();

  const hadirCount = wishes.filter(w => w.attendance === 'hadir').reduce((acc, curr) => acc + (curr.pax || 1), 0);
  const tidakHadirCount = wishes.filter(w => w.attendance === 'tidak_hadir').length;
  const raguCount = wishes.filter(w => w.attendance === 'ragu').length;

  return {
    totalInvitations: invitations.length,
    activeInvitations: invitations.filter(i => i.isPublished).length,
    totalViews: invitations.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0),
    totalWishes: wishes.length,
    totalRsvpConfirmed: hadirCount,
    rsvpBreakdown: {
      hadir: hadirCount,
      tidak_hadir: tidakHadirCount,
      ragu: raguCount,
    },
  };
}

/**
 * Reset local seed data (useful for admin testing)
 */
export function resetToSeedData() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(INITIAL_INVITATIONS));
  localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(INITIAL_WISHES));
  realtimeEmitter.notify('invitations_updated');
  realtimeEmitter.notify('wishes_updated');
}
