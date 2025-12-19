
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Character {
    name: string;
    archetype: 'hero' | 'villain';
    description: string;
    energy: number;
    traits: string[];
    avatar?: string;
}

export interface TechSection {
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    content: string;
}

export interface TechTaskData {
    userName?: string;
    projectUrl?: string;
    missionBrief: TechSection;
    techStack: TechSection;
    userFlow: TechSection;
    roles: TechSection;
    admin: TechSection;
    estimation?: {
        hours: number;
        cost: number;
        locked: boolean;
    };
}

export interface AmbikaData {
    insight?: string;
    systemModel?: string;
    resources?: string;
    solution?: string;
    briefSummary?: string;
    mainPyCode?: string; // The downloadable Python code
    briefPdfContent?: string; // Content for the summary/brief
    discoveryAnswers?: {
        context?: string;
        audience?: string;
        outcome?: string;
        confirmed?: boolean;
    };
    costEstimate?: {
        hours: number;
        cost: number;
        timeline: string;
    };
}

// Added QuadrantData for 4-Quadrant System Mirror visualization
export interface QuadrantData {
    status: string;
    level: number;
}

export interface InsightCartridge {
    id: string;
    userName?: string;
    projectUrl?: string; // Added for persistence
    systemName?: string; // Added for persistence
    credits: number;
    mode: 'GAME' | 'TECH_TASK' | 'STRATEGY_SESSION'; 
    hero: Character;
    villain: Character;
    tension: number;
    entropy: number;
    ambikaStage: number; // 0-8
    ambikaData: AmbikaData;
    // Added quadrants for system integrity tracking
    quadrants: {
        strategy: QuadrantData;
        creative: QuadrantData;
        producing: QuadrantData;
        media: QuadrantData;
    };
    chatHistory: { role: 'user' | 'model' | 'system', content: string }[];
    status: 'EMPTY' | 'INSERTED' | 'SYSTEMATIZING' | 'COMPLETE';
}

export const createEmptyCartridge = (mode: 'GAME' | 'TECH_TASK' | 'STRATEGY_SESSION' = 'STRATEGY_SESSION'): InsightCartridge => ({
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
    credits: 8, 
    mode: mode,
    hero: { name: 'HERO', archetype: 'hero', description: '', energy: 10, traits: [] },
    villain: { name: 'VILLAIN', archetype: 'villain', description: '', energy: 10, traits: [] },
    tension: 0,
    entropy: 100,
    ambikaStage: 0,
    ambikaData: { discoveryAnswers: {} },
    // Initialize quadrants with zeroed state
    quadrants: {
        strategy: { status: 'INITIALIZING', level: 0 },
        creative: { status: 'INITIALIZING', level: 0 },
        producing: { status: 'INITIALIZING', level: 0 },
        media: { status: 'INITIALIZING', level: 0 }
    },
    chatHistory: [],
    status: 'EMPTY'
});

export const updateCartridgeProgress = (
    cartridge: InsightCartridge, 
    delta: Partial<InsightCartridge>
): InsightCartridge => {
    const prevDiscovery = cartridge.ambikaData?.discoveryAnswers || {};
    const deltaDiscovery = delta.ambikaData?.discoveryAnswers || {};
    const nextAmbikaData = { 
        ...cartridge.ambikaData, 
        ...(delta.ambikaData || {}),
        discoveryAnswers: { ...prevDiscovery, ...deltaDiscovery }
    };
    
    const nextAmbikaStage = delta.ambikaStage !== undefined ? delta.ambikaStage : cartridge.ambikaStage;
    const nextEntropy = Math.max(0, 100 - ((nextAmbikaStage / 8) * 100));

    return {
        ...cartridge,
        ...delta,
        entropy: nextEntropy,
        ambikaData: nextAmbikaData,
    };
};
