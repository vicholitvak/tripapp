/**
 * Firebase Admin SDK for server-side operations
 * This bypasses Firestore security rules and should only be used in API routes
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  // For local development, use service account key
  // For production, use default credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // Use Application Default Credentials (works in Firebase hosting, Cloud Functions, etc.)
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  console.log('✅ Firebase Admin SDK initialized');
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export { admin };
