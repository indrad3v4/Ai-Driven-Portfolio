
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db, googleProvider } from "../lib/firebase";
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User, signInAnonymously } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore";
import { InsightCartridge } from "../lib/insight-object";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  credits: number;
  isPremium: boolean;
}

/**
 * Sanitize object for Firestore.
 * Firestore rejects 'undefined' values and non-plain objects.
 */
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
    
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        credits: 20,
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

// 2. SAVE WORKSPACE STATE (Private)
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

    // Ensure session exists for ownership tracking required by rules
    if (!auth.currentUser) {
        try {
            await signInAnonymously(auth);
        } catch (e: any) {
            console.warn("Auto-Save: Anonymous auth failed", e.message);
        }
    }

    try {
        const cleanCartridge = sanitizeForFirestore(cartridge);
        
        // Rules require: request.resource.data.ownerId == request.auth.uid
        if (auth.currentUser) {
            cleanCartridge.ownerId = auth.currentUser.uid;
        }
        cleanCartridge.updatedAt = new Date().toISOString();

        await setDoc(doc(db, "public_cartridges", cartridge.id), cleanCartridge, { merge: true });
        console.log("Cloud Sync OK:", cartridge.id.slice(0, 8));
    } catch (e: any) {
        const msg = e.message || e.toString();
        if (e.code === 'permission-denied' || msg.includes('insufficient permissions')) {
             console.warn("Cloud Sync Paused: Permission Denied. (Rules may be propagating or ownership mismatch)");
        } else {
             console.error("Cloud Sync Error:", msg);
        }
    }
};

// 2c. LOAD PUBLIC CARTRIDGE
export const loadPublicCartridge = async (id: string): Promise<InsightCartridge | null> => {
    // FIX: Collection is public (read: if true). 
    // We do NOT attempt to sign in here to avoid race conditions and transient permission errors 
    // while the auth state is transitioning.
    try {
        const snap = await getDoc(doc(db, "public_cartridges", id));
        if (snap.exists()) {
            return snap.data() as InsightCartridge;
        }
        return null;
    } catch (e: any) {
        const msg = e.message || e.toString();
        if (e.code === 'permission-denied' || msg.includes('insufficient permissions')) {
             console.warn(`Restore Skipped: Access denied for ${id.slice(0,8)}. Rules propagation may be pending.`);
             return null;
        }
        console.error("Restore Error:", msg);
        return null;
    }
};

// 3. CREDITS
export const deductCredit = async (userId: string): Promise<boolean> => {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data().credits >= 1) {
        await updateDoc(userRef, { credits: increment(-1) });
        return true;
    }
    return false;
};

// 4. AUTH OBSERVATION
export const subscribeToAuth = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export const logout = async () => {
    await firebaseSignOut(auth);
};

// 5. ACCESS CODES
export const generateAccessCode = async (): Promise<string> => {
    try {
        const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
        const code = `TZ-${randomHex}`;
        await setDoc(doc(db, "access_codes", code), {
            code: code,
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            claimedBy: null,
            claimedAt: null
        });
        return code;
    } catch (e) {
        console.error("Access Code Error:", e);
        return `TZ-${Math.floor(Math.random() * 900000) + 100000}`; 
    }
};

export const claimAccessCode = async (code: string, userId?: string): Promise<boolean> => {
    try {
        const codeRef = doc(db, "access_codes", code);
        const codeSnap = await getDoc(codeRef);
        if (codeSnap.exists()) {
            const data = codeSnap.data();
            if (data.status === 'ACTIVE') {
                await updateDoc(codeRef, {
                    status: 'CLAIMED',
                    claimedBy: userId || 'anonymous',
                    claimedAt: new Date().toISOString()
                });
                return true;
            } else if (data.status === 'CLAIMED') {
                if (userId && data.claimedBy === userId) return true;
                return false; 
            }
        }
        // Fallback for hardcoded bypass keys
        if (code === "TZ_abc123xyz" || code === "esCDtT#1mwHLn@qHEjne") return true;
        return false;
    } catch (e) {
        return code === "TZ_abc123xyz"; 
    }
};
