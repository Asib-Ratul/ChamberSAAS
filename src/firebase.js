import { cert, getApps, initializeApp } from 'firebase-admin/app';

/**
 * Initialize Firebase Admin when credentials are configured.
 * Returns null during local development when Firebase is not configured.
 */
export function getFirebaseApp() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) return null;

  const existing = getApps().find((app) => app.name === 'chamber');
  if (existing) return existing;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  }, 'chamber');
}
