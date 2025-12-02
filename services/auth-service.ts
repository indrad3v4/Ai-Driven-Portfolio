
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { InsightCartridge } from "../lib/insight-object";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  credits: number;
  isPremium: boolean;
}

// 1. LOGIN FLOW
export const loginWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New User - Give Free Trial Credits
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: 20, // Free Trial
        isPremium: false,
        createdAt: new Date().toISOString()
      });
      return { uid: user.uid, email: user.email, displayName: user.displayName, credits: 20, isPremium: false };
    } else {
      const data = userSnap.data();
      return { uid: user.uid, email: user.email, displayName: user.displayName, credits: data.credits, isPremium: data.isPremium };
    }
  } catch (error) {
    console.error("Login Failed", error);
    return null;
  }
};

// 2. SAVE WORKSPACE STATE
export const saveWorkspace = async (userId: string, cartridge: InsightCartridge) => {
    if (!userId) return;
    try {
        const workspaceRef = doc(db, "users", userId, "workspaces", cartridge.id);
        await setDoc(workspaceRef, cartridge, { merge: true });
    } catch (e) {
        console.error("Save Failed", e);
    }
};

// 3. DEDUCT CREDIT (Server-side validation recommended for prod, client-side for MVP)
export const deductCredit = async (userId: string): Promise<boolean> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().credits >= 1) {
        await updateDoc(userRef, {
            credits: increment(-1)
        });
        return true;
    }
    return false;
};

// 4. OBSERVE AUTH STATE
export const subscribeToAuth = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const logout = async () => {
    await firebaseSignOut(auth);
};
