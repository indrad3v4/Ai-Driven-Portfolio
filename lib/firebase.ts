
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE THIS WITH YOUR CONFIG FROM FIREBASE CONSOLE (Link #3)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSy...", 
  authDomain: "indra-flywheel-db.firebaseapp.com",
  projectId: "indra-flywheel-db",
  storageBucket: "indra-flywheel-db.appspot.com",
  messagingSenderId: "3645...",
  appId: "1:3645...:web:..."
};

// Initialize Firebase (Singleton)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
