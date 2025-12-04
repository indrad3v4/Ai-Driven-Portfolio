/**
 * @license SPDX-License-Identifier: Apache-2.0
 * Game Portal Hook: Persistent state across landing page ↔ game
 * Pattern: Zustand + localStorage (battle-tested on n8n, Vercel projects)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { InsightCartridge, createEmptyCartridge } from '../lib/insight-object';

interface GamePortalState {
  cartridge: InsightCartridge;
  portalActive: boolean; // True when user clicks Logo to go home (SETUP state)
}

interface GamePortalActions {
  // State setters
  setCartridge: (cartridge: InsightCartridge | ((prev: InsightCartridge) => InsightCartridge)) => void;
  
  // Portal navigation
  activatePortal: () => void;
  deactivatePortal: () => void;
  
  // Reset
  resetGame: () => void;
}

const initialState: GamePortalState = {
  cartridge: createEmptyCartridge(),
  portalActive: false,
};

/**
 * Global game state with automatic localStorage persistence
 * Survives page reloads, tab switches, even browser close
 */
export const useGamePortal = create<GamePortalState & GamePortalActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCartridge: (update) => {
        set((state) => ({
          cartridge: typeof update === 'function' ? update(state.cartridge) : update
        }));
      },

      activatePortal: () => {
        set({ portalActive: true });
        console.log('[GamePortal] Portal activated - return home');
      },

      deactivatePortal: () => {
        set({ portalActive: false });
      },

      resetGame: () => {
        set(initialState);
        console.log('[GamePortal] Game reset');
      },
    }),
    {
      name: 'indra-game-portal', // localStorage key
      version: 1,
      partialize: (state) => ({
        // Persist the cartridge, but not necessarily ephemeral UI state if we wanted to separate
        cartridge: state.cartridge,
        // We might NOT want to persist portalActive if we want to start on landing on reload,
        // but for "state restoration" it can be useful. 
        // Actually, let's persist cartridge only to be safe, portalActive is session-based usually.
        // But if we want "return to game" feel, maybe we persist it.
        // Let's persist cartridge. portalActive defaults to false on load usually? 
        // Actually, if user is deep in game, reload should probably keep them there.
        // We'll persist cartridge. App.tsx logic will handle routing based on cartridge state + portalActive.
        portalActive: state.portalActive, 
      }),
    }
  )
);

/**
 * Helper hook: Check if user has active progress
 * Use in Logo component to show progress badge
 */
export const useHasActiveProgress = () => {
  const cartridge = useGamePortal((state) => state.cartridge);
  
  // Has progress if status is not EMPTY or if turns > 0
  const hasProgress = cartridge.status !== 'EMPTY' && cartridge.chatHistory.length > 0;
  
  // Calculate turns roughly
  const currentTurn = Math.floor(cartridge.chatHistory.length / 2);
  
  const architectName = cartridge.userName && cartridge.userName !== "UNDEFINED" ? cartridge.userName : null;

  return {
    hasProgress,
    progressLabel: architectName
      ? `${architectName} • Turn ${currentTurn}`
      : `Turn ${currentTurn}`,
  };
};