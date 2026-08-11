import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from '../../config/env.js';

let initialized = false;

function initAdmin() {
  if (initialized) return;

  if (env.isEmulator) {
    initializeApp({ projectId: env.projectId });
  } else if (env.serviceAccountPath) {
    initializeApp({
      credential: cert(env.serviceAccountPath),
      projectId: env.projectId
    });
  } else {
    initializeApp({
      credential: applicationDefault(),
      projectId: env.projectId
    });
  }

  if (env.firestoreEmulatorHost) {
    getFirestore().settings({
      host: env.firestoreEmulatorHost,
      ssl: false
    });
  }

  initialized = true;
}

initAdmin();

export const adminAuth = getAuth();
export const adminDb = getFirestore();
