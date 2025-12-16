


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

export interface TechSection {
    status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
    content: string;
}

export interface TechTaskData {
    userName?: string;
    projectUrl?: string; // Context Anchor
    
    // 1. MISSION BRIEF (General Info)
    missionBrief: TechSection;
    
    // 2. TECH STACK (The How)
    techStack: TechSection;
    
    // 3. USER FLOW (The Structure)
    userFlow: TechSection;
    
    // 4. ROLES (Agent Swarm)
    roles: TechSection;
    
    // 5. ADMIN (God Mode)
    admin: TechSection;

    estimation?: {
        hours: number;
        cost: number;
        locked: boolean;
    };
}

export interface TrizStage {
    id: number;
    name: string;
    status: 'PENDING' | 'ANALYZING' | 'COMPLETE';
}

export interface TrizData {
    currentStage: number; // 0-8
    stages: TrizStage[];
    problemStatement: string;
}

// AMBIKA 8-STAGE DATA
export interface AmbikaData {
    insight?: string;
    systemModel?: string;
    resources?: string;
    ifr?: string;
    solution?: string;
    channels?: string;
    briefSummary?: string;
    mainPyOutline?: string;
    costEstimate?: {
        hours: number;
        cost: number;
        timeline: string;
    };
}

// NEW: The 5-Step Strategy Cascade (Legacy Support kept for types, but unused in new flow)
export interface StrategyStep {
    id: 'ASPIRATION' | 'WHERE' | 'HOW' | 'CAPABILITIES' | 'METRICS';
    label: string;
    question: string;
    content: string;
    status: 'PENDING' | 'ANALYZING' | 'LOCKED_IN';
    insight?: string; // The "AI Analysis" of the input
}

export interface StrategyAnalysis {
    detectedArchetype?: string | null; // e.g. "CREATOR"
    suggestedFramework?: string | null; // e.g. "Blue Ocean Strategy"
    hiddenNeed?: string | null; // e.g. "Validation"
}

export interface StrategyCascade {
    currentStepIndex: number; // 0-4
    tutorialViewed: boolean; // Has the user seen the rules?
    analysis?: StrategyAnalysis; // Psychological profile
    steps: {
        winningAspiration: StrategyStep;
        whereToPlay: StrategyStep;
        howToWin: StrategyStep;
        capabilities: StrategyStep;
        metrics: StrategyStep;
    };
}

export interface InsightCartridge {
    id: string;
    userName?: string;    // The Architect's name
    credits: number;      // Economy resource (1.0 per turn)
    
    mode: 'GAME' | 'TECH_TASK' | 'TRIZ_SOLVER' | 'STRATEGY_SESSION'; 

    hero: Character;      // Driver (Emerald Energy)
    villain: Character;   // Barrier (Ruby Energy)
    tension: number;      // 0-100 Conflict Magnitude
    
    // RPG LAYER: The Boss Health
    entropy: number;      // 100 (Chaos) -> 0 (Order)
    
    // The 4 Lenses of Systematization (GAME MODE)
    quadrants: {
        strategy: QuadrantData;  // Emerald
        creative: QuadrantData;  // Amethyst
        producing: QuadrantData; // Sapphire
        media: QuadrantData;     // Ruby
    };

    // Technical Specification Data (TECH_TASK MODE)
    techTask?: TechTaskData;

    // TRIZ Solver Data (TRIZ_SOLVER MODE)
    triz?: TrizData;

    // Strategy Session Data (STRATEGY_SESSION MODE)
    strategyCascade?: StrategyCascade;
    
    // NEW: AMBIKA 8-STAGE JOURNEY STATE
    ambikaStage: number; // 0-8
    ambikaData: AmbikaData;

    chatHistory: { role: 'user' | 'model' | 'system', content: string }[];
    systemSpec: SystemSpec | null; // The "Saved Code" artifact
    
    status: 'EMPTY' | 'INSERTED' | 'SYSTEMATIZING' | 'GAMEPLAY' | 'COMPLETE';
    cabinetUnlocked: boolean; // Tracks if user has entered the secret code
}

export const createEmptyCartridge = (mode: 'GAME' | 'TECH_TASK' | 'TRIZ_SOLVER' | 'STRATEGY_SESSION' = 'STRATEGY_SESSION'): InsightCartridge => ({
    // Use polyfill for UUID to ensure compatibility in all webviews/social browsers
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }),
    credits: 8, // 8 Stages = 8 Credits
    mode: mode,
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
    entropy: 100, // Starts at max chaos
    quadrants: {
        strategy: { level: 0, notes: [], status: 'ACTIVE' },
        creative: { level: 0, notes: [], status: 'LOCKED' },
        producing: { level: 0, notes: [], status: 'LOCKED' },
        media: { level: 0, notes: [], status: 'LOCKED' }
    },
    // Initialize Strategy Cascade for the new mode
    strategyCascade: mode === 'STRATEGY_SESSION' ? {
        currentStepIndex: 0,
        tutorialViewed: false,
        // FIRESTORE FIX: Initialize with null, not undefined
        analysis: { detectedArchetype: null, suggestedFramework: null, hiddenNeed: null },
        steps: {
            winningAspiration: { 
                id: 'ASPIRATION', 
                label: 'WINNING ASPIRATION', 
                question: 'What is your WINNING ASPIRATION?', 
                content: '', 
                status: 'PENDING' 
            },
            whereToPlay: { 
                id: 'WHERE', 
                label: 'WHERE TO PLAY', 
                question: 'WHERE WILL YOU PLAY?', 
                content: '', 
                status: 'PENDING' 
            },
            howToWin: { 
                id: 'HOW', 
                label: 'HOW TO WIN', 
                question: 'HOW WILL YOU WIN?', 
                content: '', 
                status: 'PENDING' 
            },
            capabilities: { 
                id: 'CAPABILITIES', 
                label: 'CORE CAPABILITIES', 
                question: 'WHAT CAPABILITIES MUST YOU HAVE?', 
                content: '', 
                status: 'PENDING' 
            },
            metrics: { 
                id: 'METRICS', 
                label: 'METRICS OF SUCCESS', 
                question: 'WHAT METRICS DO YOU NEED TO TRACK?', 
                content: '', 
                status: 'PENDING' 
            }
        }
    } : undefined,
    techTask: mode === 'TECH_TASK' ? {
        missionBrief: { status: 'PENDING', content: '' },
        techStack: { status: 'PENDING', content: '' },
        userFlow: { status: 'PENDING', content: '' },
        roles: { status: 'PENDING', content: '' },
        admin: { status: 'PENDING', content: '' },
        estimation: { hours: 0, cost: 0, locked: false }
    } : undefined,
    triz: mode === 'TRIZ_SOLVER' ? {
        currentStage: 0,
        problemStatement: '',
        stages: [
            { id: 0, name: 'INPUT DATA', status: 'PENDING' },
            { id: 1, name: 'BASE MODELS', status: 'PENDING' },
            { id: 2, name: 'INTERPRETATION', status: 'PENDING' },
            { id: 3, name: 'OPERATIONS', status: 'PENDING' },
            { id: 4, name: 'PSYCHOLOGY', status: 'PENDING' },
            { id: 5, name: 'IMAGINATION', status: 'PENDING' },
            { id: 6, name: 'TASK FORMULATION', status: 'PENDING' },
            { id: 7, name: 'ALGORITHMS', status: 'PENDING' },
            { id: 8, name: 'DEPLOYMENT', status: 'PENDING' }
        ]
    } : undefined,
    ambikaStage: 0,
    ambikaData: {},
    chatHistory: [],
    systemSpec: null,
    status: 'EMPTY',
    cabinetUnlocked: false
});

export const updateCartridgeProgress = (
    cartridge: InsightCartridge, 
    delta: Partial<InsightCartridge>
): InsightCartridge => {
    
    // Merge Strategy Cascade (Legacy support)
    let nextStrategyCascade = cartridge.strategyCascade;
    if (delta.strategyCascade) {
        const prevAnalysis = cartridge.strategyCascade?.analysis || {};
        const deltaAnalysis = delta.strategyCascade.analysis || {};
        
        nextStrategyCascade = {
            ...cartridge.strategyCascade,
            ...delta.strategyCascade,
            analysis: { ...prevAnalysis, ...deltaAnalysis },
            steps: {
                ...cartridge.strategyCascade?.steps,
                ...(delta.strategyCascade.steps || {})
            }
        } as StrategyCascade;
    }

    // Merge Ambika Data
    const nextAmbikaData = { ...cartridge.ambikaData, ...(delta.ambikaData || {}) };
    const nextAmbikaStage = delta.ambikaStage !== undefined ? delta.ambikaStage : cartridge.ambikaStage;

    // Entropy Calc
    let nextEntropy = delta.entropy !== undefined ? delta.entropy : cartridge.entropy;
    
    // Entropy based on 8 Stages
    if (cartridge.mode === 'STRATEGY_SESSION') {
        const totalStages = 8;
        const current = nextAmbikaStage;
        nextEntropy = Math.max(0, 100 - ((current / totalStages) * 100));
    }

    const updated = {
        ...cartridge,
        ...delta,
        entropy: nextEntropy,
        ambikaData: nextAmbikaData,
        strategyCascade: nextStrategyCascade
    };
    return updated;
};
