import dotenv from 'dotenv';

dotenv.config();

export interface Env {
  projectId: string;
  port: number;
  corsOrigin: string;
  firestoreEmulatorHost: string;
  authEmulatorHost: string;
  serviceAccountPath: string;
  isEmulator: boolean;
}

function readEnv(): Env {
  const projectId = process.env.GCLOUD_PROJECT || 'farmfleet-30b6a';
  const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST || '';
  const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '';

  return {
    projectId,
    port: Number(process.env.PORT || 8080),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    firestoreEmulatorHost,
    authEmulatorHost,
    serviceAccountPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || '',
    isEmulator: Boolean(firestoreEmulatorHost || authEmulatorHost)
  };
}

export const env = readEnv();
