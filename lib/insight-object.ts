
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
    photo?: string;
    archetype: 'hero' | 'villain';
    energy: number;       // 0-100 strength
    traits: string[];     // Extracted from user input
}

export interface InsightCartridge {
    id: string;
    hero: Character;      // Driver (Emerald Energy)
    villain: Character;   // Barrier (Ruby Energy)
    tension: number;      // 0-100 Conflict Magnitude
    quadrants: {
        strategy: number; // % complete
        creative: number;
        producing: number;
        media: number;
    };
    status: 'EMPTY' | 'INSERTED' | 'PLAYING' | 'COMPLETE';
}

export const createEmptyCartridge = (): InsightCartridge => ({
    id: crypto.randomUUID(),
    hero: {
        name: 'DRIVER',
        archetype: 'hero',
        energy: 50,
        traits: []
    },
    villain: {
        name: 'BARRIER',
        archetype: 'villain',
        energy: 50,
        traits: []
    },
    tension: 0,
    quadrants: {
        strategy: 0,
        creative: 0,
        producing: 0,
        media: 0
    },
    status: 'EMPTY'
});

/**
 * The "Gameplay Loop" where the Agent (Joystick) manipulates the Insight (Cartridge).
 * In a real implementation, this would involve Gemini analysis.
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
        quadrants: { ...cartridge.quadrants, ...(delta.quadrants || {}) }
    };
};
