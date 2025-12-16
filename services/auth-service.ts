
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User, signInAnonymously } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { InsightCartridge } from "../lib/insight-object";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  credits: number;
  isPremium: boolean;
}

// Helper: Sanitize object for Firestore
// Uses JSON serialization to strip non-serializable types and converts undefined to null
const sanitizeForFirestore = (obj: any): any => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (value === undefined) return null;
    return value;
  }));
};

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

// 2. SAVE WORKSPACE STATE (Authenticated)
export const saveWorkspace = async (userId: string, cartridge: InsightCartridge) => {
    if (!userId) return;
    try {
        const workspaceRef = doc(db, "users", userId, "workspaces", cartridge.id);
        const cleanCartridge = sanitizeForFirestore(cartridge);
        await setDoc(workspaceRef, cleanCartridge, { merge: true });
    } catch (e) {
        console.error("Save Failed", e);
    }
};

// 2b. SAVE PUBLIC CARTRIDGE (Anonymous / Key-Based)
export const savePublicCartridge = async (cartridge: InsightCartridge) => {
    if (!cartridge.id) return;

    // Ensure we have an auth session (Anonymous or otherwise) for RLS
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (e) {
            console.warn("Anonymous auth attempt failed (save)", e);
        }
    }

    try {
        const cleanCartridge = sanitizeForFirestore(cartridge);
        await setDoc(doc(db, "public_cartridges", cartridge.id), cleanCartridge, { merge: true });
        console.log("System Auto-Saved:", cartridge.id);
    } catch (e: any) {
        console.error("Auto-Save Failed", e.message);
    }
};

// 2c. LOAD PUBLIC CARTRIDGE
export const loadPublicCartridge = async (id: string): Promise<InsightCartridge | null> => {
    // Ensure we have an auth session (Anonymous or otherwise) for RLS
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (e) {
            console.warn("Anonymous auth attempt failed (load)", e);
        }
    }

    try {
        const snap = await getDoc(doc(db, "public_cartridges", id));
        if (snap.exists()) {
            return snap.data() as InsightCartridge;
        }
        return null;
    } catch (e) {
        console.error("Load Failed", e);
        return null;
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

// 5. ACCESS CODE SYSTEM (Cabinet Unlock)

/**
 * Generates a unique "TZ-" code and stores it in Firestore.
 * Used when a user hits the Turn 5 wall.
 */
export const generateAccessCode = async (): Promise<string> => {
    try {
        // Generate TZ-XXXX hex code
        const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
        const code = `TZ-${randomHex}`;
        
        // Store in 'access_codes' collection
        await setDoc(doc(db, "access_codes", code), {
            code: code,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            claimedBy: null,
            claimedAt: null
        });
        
        return code;
    } catch (e) {
        console.error("Failed to generate access code", e);
        // Fallback for offline/demo mode
        return `TZ-${Math.floor(Math.random() * 900000) + 100000}`; 
    }
};

/**
 * Validates and claims an access code.
 * Returns true if valid and active.
 */
export const claimAccessCode = async (code: string, userId?: string): Promise<boolean> => {
    try {
        const codeRef = doc(db, "access_codes", code);
        const codeSnap = await getDoc(codeRef);

        if (codeSnap.exists()) {
            const data = codeSnap.data();
            if (data.status === 'ACTIVE') {
                // Mark as claimed
                await updateDoc(codeRef, {
                    status: 'CLAIMED',
                    claimedBy: userId || 'anonymous',
                    claimedAt: new Date().toISOString()
                });
                return true;
            } else if (data.status === 'CLAIMED') {
                // For MVP, we might allow re-use by same user, but let's be strict for now
                // Or if it's the same user, allow it. 
                if (userId && data.claimedBy === userId) return true;
                return false; 
            }
        }
        
        // Fallback for hardcoded admin/demo codes
        if (code === "TZ_abc123xyz" || code === "esCDtT#1mwHLn@qHEjne") return true;
        
        return false;
    } catch (e) {
        console.error("Failed to verify code", e);
        // If offline/error, allow specific fallback
        return code === "TZ_abc123xyz"; 
    }
};
