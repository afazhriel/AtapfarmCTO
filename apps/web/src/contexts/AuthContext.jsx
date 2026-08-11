import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

function normalizeUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    emailVerified: Boolean(firebaseUser.emailVerified),
    providerData: firebaseUser.providerData || []
  };
}

async function syncUserProfile(firebaseUser) {
  if (!firebaseUser || !db) return null;
  const ref = doc(db, 'users', firebaseUser.uid);
  const snapshot = await getDoc(ref);
  const payload = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
    emailVerified: firebaseUser.emailVerified,
    lastLoginAt: serverTimestamp()
  };
  await setDoc(
    ref,
    {
      ...payload,
      ...(!snapshot.exists() ? { createdAt: serverTimestamp() } : {})
    },
    { merge: true }
  );
  return payload;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(normalizeUser(firebaseUser));
        if (firebaseUser) {
          const synced = await syncUserProfile(firebaseUser);
          setProfile(synced);
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      configured: isFirebaseConfigured,
      async login(email, password, remember = true) {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        return signInWithEmailAndPassword(auth, email, password);
      },
      async register(displayName, email, password) {
        await setPersistence(auth, browserLocalPersistence);
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName });
        await sendEmailVerification(credential.user);
        await syncUserProfile(credential.user);
        setUser(normalizeUser(credential.user));
        return credential;
      },
      async signInWithGoogle() {
        await setPersistence(auth, browserLocalPersistence);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return signInWithPopup(auth, provider);
      },
      async resetPassword(email) {
        return sendPasswordResetEmail(auth, email);
      },
      async resendVerification() {
        if (!auth.currentUser) throw new Error('No active user.');
        return sendEmailVerification(auth.currentUser);
      },
      async refreshUser() {
        if (!auth.currentUser) return false;
        await reload(auth.currentUser);
        setUser(normalizeUser(auth.currentUser));
        await syncUserProfile(auth.currentUser);
        return auth.currentUser.emailVerified;
      },
      async updateOwnProfile(displayName) {
        if (!auth.currentUser) throw new Error('No active user.');
        await updateProfile(auth.currentUser, { displayName });
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          displayName,
          updatedAt: serverTimestamp()
        }, { merge: true });
        setUser(normalizeUser(auth.currentUser));
        setProfile((current) => ({ ...(current || {}), displayName }));
      },
      async logout() {
        return signOut(auth);
      }
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
