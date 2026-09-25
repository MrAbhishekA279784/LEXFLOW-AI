/// <reference types="vite/client" />
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lexflow-dev.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lexflow-dev",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lexflow-dev.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app: FirebaseApp;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn("Firebase initialization deferred:", e);
  app = getApps().length === 0 ? initializeApp({ apiKey: "AIzaSyDummyKeyForDevelopment123456", projectId: "lexflow-dev" }) : getApp();
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
