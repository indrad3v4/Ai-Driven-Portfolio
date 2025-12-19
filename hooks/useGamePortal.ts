
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
  portalActive: boolean; 
  _hasHydrated: boolean; // Tracking for state restoration
}

interface GamePortalActions {
  setCartridge: (cartridge: InsightCartridge | ((prev: InsightCartridge) => InsightCartridge)) => void;
  activatePortal: () => void;
  deactivatePortal: () => void;
  resetGame: () => void;
  setHasHydrated: (state: boolean) => void;
}

const initialState: GamePortalState = {
  cartridge: createEmptyCartridge(),
  portalActive: false,
  _hasHydrated: false,
};

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
      },

      deactivatePortal: () => {
        set({ portalActive: false });
      },

      resetGame: () => {
        set(initialState);
      },

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'indra-game-portal',
      version: 1,
      onRehydrateStorage: (state) => {
        return () => state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        cartridge: state.cartridge,
        portalActive: state.portalActive, 
      }),
    }
  )
);

export const useHasActiveProgress = () => {
  const cartridge = useGamePortal((state) => state.cartridge);
  const hasProgress = cartridge && cartridge.status !== 'EMPTY' && cartridge.chatHistory?.length > 0;
  const currentTurn = hasProgress ? Math.floor(cartridge.chatHistory.length / 2) : 0;
  const architectName = cartridge?.userName && cartridge.userName !== "UNDEFINED" ? cartridge.userName : null;

  return {
    hasProgress,
    progressLabel: architectName
      ? `${architectName} • Turn ${currentTurn}`
      : `Turn ${currentTurn}`,
  };
};
