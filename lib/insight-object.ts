
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
    // Content: Background, Audience, Core Problem, Solution Hypothesis, North Star, Timeline
    missionBrief: TechSection;
    
    // 2. TECH STACK (The How)
    // Content: Frontend, Backend, Database, AI (Models), Orchestration, Vector DB
    techStack: TechSection;
    
    // 3. USER FLOW (The Structure)
    // Content: Journey, Prompt Chains, Latency Budgets
    userFlow: TechSection;
    
    // 4. ROLES (Agent Swarm)
    // Content: Specific Agents, Tools
    roles: TechSection;
    
    // 5. ADMIN (God Mode)
    // Content: Dashboard, Observability, Cost Tracking
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

export interface InsightCartridge {
    id: string;
    userName?: string;    // The Architect's name
    credits: number;      // Economy resource (1.0 per turn)
    
    mode: 'GAME' | 'TECH_TASK' | 'TRIZ_SOLVER'; // NEW: Operation Mode

    hero: Character;      // Driver (Emerald Energy)
    villain: Character;   // Barrier (Ruby Energy)
    tension: number;      // 0-100 Conflict Magnitude
    
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
    
    chatHistory: { role: 'user' | 'model' | 'system', content: string }[];
    systemSpec: SystemSpec | null; // The "Saved Code" artifact
    
    status: 'EMPTY' | 'INSERTED' | 'SYSTEMATIZING' | 'GAMEPLAY' | 'COMPLETE';
    cabinetUnlocked: boolean; // Tracks if user has entered the secret code
}

export const createEmptyCartridge = (mode: 'GAME' | 'TECH_TASK' | 'TRIZ_SOLVER' = 'GAME'): InsightCartridge => ({
    id: crypto.randomUUID(),
    credits: 10, // 10 free turns (Enhanced Starter Pack)
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
    quadrants: {
        strategy: { level: 0, notes: [], status: 'ACTIVE' },
        creative: { level: 0, notes: [], status: 'LOCKED' },
        producing: { level: 0, notes: [], status: 'LOCKED' },
        media: { level: 0, notes: [], status: 'LOCKED' }
    },
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
    chatHistory: [],
    systemSpec: null,
    status: 'EMPTY',
    cabinetUnlocked: false
});

/**
 * The "Gameplay Loop" where the Agent (Joystick) manipulates the Insight (Cartridge).
 * Ensures deep merging to prevent overwriting nested state.
 */
export const updateCartridgeProgress = (
    cartridge: InsightCartridge, 
    delta: Partial<InsightCartridge>
): InsightCartridge => {
    
    // Default structure to ensure safety against partial objects
    const defaultTechTask: TechTaskData = {
        missionBrief: { status: 'PENDING', content: '' },
        techStack: { status: 'PENDING', content: '' },
        userFlow: { status: 'PENDING', content: '' },
        roles: { status: 'PENDING', content: '' },
        admin: { status: 'PENDING', content: '' },
        estimation: { hours: 0, cost: 0, locked: false }
    };

    // Construct the base task by safely merging defaults. 
    const existingTask = (cartridge.techTask || {}) as Partial<TechTaskData>;
    const baseTechTask: TechTaskData = {
        userName: existingTask.userName,
        projectUrl: existingTask.projectUrl, 
        missionBrief: existingTask.missionBrief || defaultTechTask.missionBrief,
        techStack: existingTask.techStack || defaultTechTask.techStack,
        userFlow: existingTask.userFlow || defaultTechTask.userFlow,
        roles: existingTask.roles || defaultTechTask.roles,
        admin: existingTask.admin || defaultTechTask.admin,
        estimation: existingTask.estimation || defaultTechTask.estimation
    };

    const deltaTechTask = (delta.techTask || {}) as Partial<TechTaskData>;
    
    // Only construct merged task if one exists or is being added
    const shouldHaveTask = !!(cartridge.techTask || delta.techTask);

    const mergedTechTask: TechTaskData | undefined = shouldHaveTask ? {
        ...baseTechTask,
        ...deltaTechTask,
        // Deep merge individual sections
        missionBrief: { ...baseTechTask.missionBrief, ...(deltaTechTask.missionBrief || {}) },
        techStack: { ...baseTechTask.techStack, ...(deltaTechTask.techStack || {}) },
        userFlow: { ...baseTechTask.userFlow, ...(deltaTechTask.userFlow || {}) },
        roles: { ...baseTechTask.roles, ...(deltaTechTask.roles || {}) },
        admin: { ...baseTechTask.admin, ...(deltaTechTask.admin || {}) },
        // TRIZ Principle #13: Deep merge estimation to prevent overwrite by partial data
        estimation: { ...baseTechTask.estimation, ...(deltaTechTask.estimation || {}) }
    } : undefined;

    const updated = {
        ...cartridge,
        ...delta,
        hero: { ...cartridge.hero, ...(delta.hero || {}) },
        villain: { ...cartridge.villain, ...(delta.villain || {}) },
        quadrants: { 
            strategy: { ...cartridge.quadrants.strategy, ...(delta.quadrants?.strategy || {}) },
            creative: { ...cartridge.quadrants.creative, ...(delta.quadrants?.creative || {}) },
            producing: { ...cartridge.quadrants.producing, ...(delta.quadrants?.producing || {}) },
            media: { ...cartridge.quadrants.media, ...(delta.quadrants?.media || {}) }
        },
        techTask: mergedTechTask
    };
    return updated;
};
