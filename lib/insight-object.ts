
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * INSIGHT-AS-OBJECT METAPHOR
 * 
 * Insight = Game Cartridge
 * Agent = Joystick (manipulates the insight)
 * Gameplay = Systematization Loop
 */

export interface Character {
    name: string;
    archetype: 'hero' | 'villain';
    description: string;
    energy: number;       // 0-100 strength
    traits: string[];     // Extracted from user input
    avatar?: string;      // URL/Base64 of visual representation
}

export interface QuadrantData {
    level: number; // 0-100%
    notes: string[];
    status: 'LOCKED' | 'ACTIVE' | 'ANALYZING' | 'OPTIMIZED';
}

export interface SystemSpec {
    pythonCode: string;
    requirements: string[];
    envVars: string[];
    deployInstructions: string;
}

export interface InsightCartridge {
    id: string;
    userName?: string;    // The Architect's name
    credits: number;      // Economy resource (1.0 per turn)
    hero: Character;      // Driver (Emerald Energy)
    villain: Character;   // Barrier (Ruby Energy)
    tension: number;      // 0-100 Conflict Magnitude
    
    // The 4 Lenses of Systematization
    quadrants: {
        strategy: QuadrantData;  // Emerald
        creative: QuadrantData;  // Amethyst
        producing: QuadrantData; // Sapphire
        media: QuadrantData;     // Ruby
    };
    
    chatHistory: { role: 'user' | 'model' | 'system', content: string }[];
    systemSpec: SystemSpec | null; // The "Saved Code" artifact
    
    status: 'EMPTY' | 'INSERTED' | 'SYSTEMATIZING' | 'GAMEPLAY' | 'COMPLETE';
}

export const createEmptyCartridge = (): InsightCartridge => ({
    id: crypto.randomUUID(),
    credits: 20, // ~20 free turns @ 1.0 credits/turn
    hero: {
        name: 'HERO',
        archetype: 'hero',
        description: '',
        energy: 10,
        traits: []
    },
    villain: {
        name: 'VILLAIN',
        archetype: 'villain',
        description: '',
        energy: 10,
        traits: []
    },
    tension: 0,
    quadrants: {
        strategy: { level: 0, notes: [], status: 'ACTIVE' },
        creative: { level: 0, notes: [], status: 'LOCKED' },
        producing: { level: 0, notes: [], status: 'LOCKED' },
        media: { level: 0, notes: [], status: 'LOCKED' }
    },
    chatHistory: [],
    systemSpec: null,
    status: 'EMPTY'
});

/**
 * The "Gameplay Loop" where the Agent (Joystick) manipulates the Insight (Cartridge).
 * Ensures deep merging to prevent overwriting nested state.
 */
export const updateCartridgeProgress = (
    cartridge: InsightCartridge, 
    delta: Partial<InsightCartridge>
): InsightCartridge => {
    return {
        ...cartridge,
        ...delta,
        hero: { ...cartridge.hero, ...(delta.hero || {}) },
        villain: { ...cartridge.villain, ...(delta.villain || {}) },
        quadrants: { 
            strategy: { ...cartridge.quadrants.strategy, ...(delta.quadrants?.strategy || {}) },
            creative: { ...cartridge.quadrants.creative, ...(delta.quadrants?.creative || {}) },
            producing: { ...cartridge.quadrants.producing, ...(delta.quadrants?.producing || {}) },
            media: { ...cartridge.quadrants.media, ...(delta.quadrants?.media || {}) },
        }
    };
};
