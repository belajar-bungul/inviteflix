import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { AdminUser } from './types';

const ADMIN_STORAGE_KEY = 'inviteflix_admin_session_v1';

export const DEMO_ADMIN: AdminUser = {
  uid: 'admin-demo-master',
  email: 'admin@inviteflix.com',
  displayName: 'Netflix Lead Administrator',
  role: 'owner',
};

class AuthEmitter extends EventTarget {
  notify(type: string, data?: unknown) {
    this.dispatchEvent(new CustomEvent(type, { detail: data }));
  }
}
const authEmitter = new AuthEmitter();

export function getStoredAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: AdminUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
  authEmitter.notify('auth_state_change', user);
}

export async function loginAdmin(email: string, pass: string): Promise<AdminUser> {
  // If Firebase Auth is configured and active, authenticate against Firebase
  if (isFirebaseConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const user: AdminUser = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        displayName: cred.user.displayName || email.split('@')[0],
        role: 'admin',
      };
      setStoredAdminUser(user);
      return user;
    } catch (err: unknown) {
      console.warn('Firebase signIn failed:', err);
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      throw new Error(msg);
    }
  }

  // Demo / Fallback login verification
  if (email.toLowerCase().trim() === 'admin@inviteflix.com' && pass === 'netflix2025') {
    const user = { ...DEMO_ADMIN };
    setStoredAdminUser(user);
    return user;
  }

  // Also permit custom local admin logins
  if (email.includes('@') && pass.length >= 6) {
    const customUser: AdminUser = {
      uid: `admin-${Date.now()}`,
      email: email.trim(),
      displayName: email.split('@')[0].toUpperCase(),
      role: 'admin',
    };
    setStoredAdminUser(customUser);
    return customUser;
  }

  throw new Error('Invalid email or password. Use demo: admin@inviteflix.com / netflix2025');
}

export async function logoutAdmin(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
  }
  setStoredAdminUser(null);
}

export function subscribeToAuth(callback: (user: AdminUser | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  if (isFirebaseConfigured && auth) {
    const unsub = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        const admin: AdminUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Administrator',
          role: 'admin',
        };
        setStoredAdminUser(admin);
        callback(admin);
      } else {
        const stored = getStoredAdminUser();
        // If stored was demo, keep it; else null
        if (stored?.uid.startsWith('admin-demo')) {
          callback(stored);
        } else {
          callback(null);
        }
      }
    });

    return unsub;
  }

  // Local emitter subscriber
  callback(getStoredAdminUser());

  const handler = () => {
    callback(getStoredAdminUser());
  };

  authEmitter.addEventListener('auth_state_change', handler);
  return () => {
    authEmitter.removeEventListener('auth_state_change', handler);
  };
}

