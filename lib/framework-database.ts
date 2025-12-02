
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * FRAMEWORK DATABASE — PSYCHOLOGICAL & STRATEGIC METHODOLOGIES
 * 
 * Purpose: Match user's Hero-Villain dynamic to relevant frameworks
 * without requiring Google Search API calls.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ArchetypeType =
  | "CREATOR"
  | "HERO"
  | "EXPLORER"
  | "SAGE"
  | "MAGICIAN"
  | "RULER"
  | "CAREGIVER"
  | "LOVER"
  | "JESTER"
  | "EVERYMAN"
  | "INNOCENT"
  | "OUTLAW"
  | "ALL";

export type BarrierType = "internal" | "external" | "hybrid";

export type FrameworkCategory = "Western" | "Eastern" | "Business" | "Esoteric" | "TRIZ";

export interface Framework {
  name: string;
  category: FrameworkCategory;
  archetypes: ArchetypeType[];
  barrierTypes: BarrierType[];
  keywords: string[];
  description: string;
  application: string;
}

export interface ArchetypeDefinition {
  name: ArchetypeType;
  keywords: string[];
  driver: string;
  shadow: string;
}

// ============================================================================
// ARCHETYPE DATABASE
// ============================================================================

export const ARCHETYPES: ArchetypeDefinition[] = [
  {
    name: "CREATOR",
    keywords: ["create", "build", "make", "design", "innovate", "express", "art", "craft", "develop", "produce"],
    driver: "Self-expression, bringing vision to life",
    shadow: "Perfectionism, never finishing, fear of mediocrity"
  },
  {
    name: "HERO",
    keywords: ["achieve", "overcome", "challenge", "prove", "win", "conquer", "impact", "transform", "fight", "succeed"],
    driver: "Mastery, proving worth through achievement",
    shadow: "Burnout, arrogance, measuring worth by wins"
  },
  {
    name: "EXPLORER",
    keywords: ["discover", "explore", "adventure", "freedom", "travel", "new", "unknown", "experience", "journey", "search"],
    driver: "Freedom, experiencing fullness of life",
    shadow: "Restlessness, inability to commit, escapism"
  },
  {
    name: "SAGE",
    keywords: ["understand", "learn", "truth", "wisdom", "teach", "research", "knowledge", "study", "analyze", "investigate"],
    driver: "Understanding, discovering truth",
    shadow: "Analysis paralysis, ivory tower detachment"
  },
  {
    name: "MAGICIAN",
    keywords: ["transform", "manifest", "power", "vision", "change", "alchemy", "shift", "realize", "actualize", "catalyze"],
    driver: "Transformation, making dreams real",
    shadow: "Manipulation, using power unethically"
  },
  {
    name: "RULER",
    keywords: ["lead", "control", "organize", "manage", "structure", "authority", "empire", "govern", "direct", "command"],
    driver: "Control, creating order from chaos",
    shadow: "Tyranny, micromanagement, fear of chaos"
  },
  {
    name: "CAREGIVER",
    keywords: ["help", "nurture", "support", "protect", "serve", "care", "heal", "assist", "guide", "nurture"],
    driver: "Service, protecting others from harm",
    shadow: "Martyrdom, enabling, self-neglect"
  },
  {
    name: "LOVER",
    keywords: ["connect", "intimacy", "passion", "relationship", "beauty", "sensory", "love", "bond", "unite", "desire"],
    driver: "Connection, intimacy, experiencing bliss",
    shadow: "Obsession, losing self in relationships"
  },
  {
    name: "JESTER",
    keywords: ["play", "joy", "humor", "fun", "laugh", "entertain", "lightness", "enjoy", "amuse", "celebrate"],
    driver: "Joy, living in the moment",
    shadow: "Superficiality, avoiding depth, compulsive humor"
  },
  {
    name: "EVERYMAN",
    keywords: ["belong", "community", "equality", "down-to-earth", "relatable", "ordinary", "common", "typical", "normal", "regular"],
    driver: "Belonging, being part of community",
    shadow: "Losing individuality, cynicism"
  },
  {
    name: "INNOCENT",
    keywords: ["faith", "optimism", "purity", "simple", "trust", "hope", "believe", "goodness", "pure", "naive"],
    driver: "Safety, happiness, simplicity",
    shadow: "Naivety, denial, victim mentality"
  },
  {
    name: "OUTLAW",
    keywords: ["rebel", "disrupt", "revolution", "break", "liberate", "challenge", "defy", "overthrow", "radical", "subvert"],
    driver: "Liberation, revolution, breaking unjust rules",
    shadow: "Destructiveness, alienation"
  }
];

// ============================================================================
// FRAMEWORK DATABASE — 42 FRAMEWORKS
// ============================================================================

export const FRAMEWORKS: Framework[] = [
  
  // ═══════════════════════════════════════════════════════════════════════
  // WESTERN PSYCHOLOGY (14 frameworks)
  // ═══════════════════════════════════════════════════════════════════════
  
  {
    name: "Jungian Shadow Work",
    category: "Western",
    archetypes: ["CREATOR", "HERO", "SAGE", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["perfectionism", "inner critic", "self-sabotage", "fear", "shame", "guilt", "unworthiness", "shadow", "dark side", "rejected self"],
    description: "Integrate rejected parts of self (Shadow) to achieve psychological wholeness",
    application: "Explore what gifts the Villain (inner critic/perfectionism) might be protecting; reframe as ally"
  },
  
  {
    name: "Freudian Psychoanalysis",
    category: "Western",
    archetypes: ["LOVER", "CREATOR", "SAGE"],
    barrierTypes: ["internal"],
    keywords: ["unconscious", "repression", "anxiety", "defense mechanisms", "childhood", "trauma", "buried", "hidden motives"],
    description: "Uncover unconscious drives and defense mechanisms blocking conscious goals",
    application: "Probe what childhood experiences or unconscious fears fuel the Villain"
  },
  
  {
    name: "Maslow's Hierarchy of Needs",
    category: "Western",
    archetypes: ["HERO", "CAREGIVER", "RULER"],
    barrierTypes: ["internal", "external"],
    keywords: ["survival", "safety", "belonging", "esteem", "self-actualization", "needs", "basic", "security", "physiological"],
    description: "Identify which need level is unmet, blocking higher aspirations",
    application: "Determine if Villain represents lower-need threat (e.g., financial insecurity blocking creative expression)"
  },
  
  {
    name: "Cognitive Behavioral Therapy (CBT)",
    category: "Western",
    archetypes: ["ALL"],
    barrierTypes: ["internal"],
    keywords: ["negative thoughts", "cognitive distortions", "catastrophizing", "overthinking", "rumination", "thought patterns", "beliefs"],
    description: "Identify and reframe distorted thinking patterns fueling the Villain",
    application: "Map Hero's goal -> Villain's distorted thought -> Alternative reframe"
  },
  
  {
    name: "Gestalt Therapy (Empty Chair)",
    category: "Western",
    archetypes: ["CREATOR", "EXPLORER", "SAGE"],
    barrierTypes: ["internal"],
    keywords: ["inner conflict", "parts of self", "polarities", "dialogue", "integration", "fragmentation"],
    description: "Dialogue between Hero and Villain parts to find integration",
    application: "Simulate conversation: What would Hero say to Villain? What would Villain reply?"
  },
  
  {
    name: "Existential Therapy",
    category: "Western",
    archetypes: ["HERO", "EXPLORER", "SAGE"],
    barrierTypes: ["internal"],
    keywords: ["meaning", "freedom", "isolation", "death anxiety", "choice", "responsibility", "existence", "authenticity"],
    description: "Confront existential anxieties (meaninglessness, mortality) blocking authentic action",
    application: "Explore if Villain represents fear of freedom/responsibility inherent in Hero's goal"
  },
  
  {
    name: "Positive Psychology (Flow State)",
    category: "Western",
    archetypes: ["CREATOR", "MAGICIAN", "EXPLORER"],
    barrierTypes: ["internal"],
    keywords: ["flow", "optimal experience", "engagement", "peak performance", "immersion", "zone"],
    description: "Identify conditions for flow state where Villain (self-consciousness) dissolves",
    application: "Map when Hero experiences flow vs when Villain interrupts; optimize conditions"
  },
  
  {
    name: "Attachment Theory",
    category: "Western",
    archetypes: ["LOVER", "CAREGIVER", "EVERYMAN"],
    barrierTypes: ["internal"],
    keywords: ["attachment", "secure", "anxious", "avoidant", "relationships", "bonding", "connection patterns"],
    description: "Understand how early attachment patterns create current relational Villains",
    application: "If Villain involves fear of connection/abandonment, trace to attachment style"
  },
  
  {
    name: "Self-Determination Theory",
    category: "Western",
    archetypes: ["HERO", "EXPLORER", "RULER"],
    barrierTypes: ["internal", "external"],
    keywords: ["autonomy", "competence", "relatedness", "intrinsic motivation", "self-directed"],
    description: "Identify which core need (autonomy/competence/relatedness) is thwarted by Villain",
    application: "Hero's intrinsic motivation blocked when Villain threatens one of three needs"
  },
  
  {
    name: "Narrative Therapy",
    category: "Western",
    archetypes: ["SAGE", "JESTER", "OUTLAW"],
    barrierTypes: ["internal"],
    keywords: ["story", "narrative", "reframe", "rewrite", "perspective", "meaning-making"],
    description: "Rewrite Hero-Villain story from problem-saturated to possibility-rich narrative",
    application: "Externalize Villain as character in story; Hero becomes narrator who can rewrite plot"
  },
  
  {
    name: "Acceptance and Commitment Therapy (ACT)",
    category: "Western",
    archetypes: ["SAGE", "HERO", "EXPLORER"],
    barrierTypes: ["internal"],
    keywords: ["acceptance", "mindfulness", "values", "committed action", "psychological flexibility"],
    description: "Accept Villain (uncomfortable thoughts/feelings) while committing to Hero's values",
    application: "Stop fighting Villain; accept its presence, move toward Hero's values anyway"
  },
  
  {
    name: "Transactional Analysis",
    category: "Western",
    archetypes: ["RULER", "CAREGIVER", "EVERYMAN"],
    barrierTypes: ["internal", "external"],
    keywords: ["parent", "adult", "child", "ego states", "transactions", "scripts", "life positions"],
    description: "Identify which ego state (Parent/Adult/Child) Villain operates from",
    application: "If Villain is Critical Parent attacking Child, shift to Adult ego state for Hero"
  },
  
  {
    name: "Somatic Experiencing",
    category: "Western",
    archetypes: ["LOVER", "CAREGIVER", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["body", "trauma", "nervous system", "sensations", "physiological", "embodied"],
    description: "Release Villain (trauma patterns) stored in body's nervous system",
    application: "Track where Villain shows up as bodily sensation; release through somatic awareness"
  },
  
  {
    name: "Logotherapy (Frankl)",
    category: "Western",
    archetypes: ["SAGE", "HERO", "CAREGIVER"],
    barrierTypes: ["internal"],
    keywords: ["meaning", "purpose", "suffering", "existential vacuum", "will to meaning"],
    description: "Find meaning in suffering (Villain) to fuel Hero's purpose",
    application: "Reframe Villain as source of meaning: What does overcoming this make possible?"
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // EASTERN PHILOSOPHY (10 frameworks)
  // ═══════════════════════════════════════════════════════════════════════
  
  {
    name: "I Ching (Book of Changes)",
    category: "Eastern",
    archetypes: ["SAGE", "MAGICIAN", "EXPLORER"],
    barrierTypes: ["internal", "external"],
    keywords: ["change", "timing", "cycles", "transition", "uncertainty", "hexagram", "oracle"],
    description: "Navigate change by understanding current hexagram (situation) and moving lines (transitions)",
    application: "Determine which hexagram represents Hero-Villain dynamic (e.g., Hexagram 12 Standstill -> 11 Peace)"
  },
  
  {
    name: "Taoist Wu Wei (Effortless Action)",
    category: "Eastern",
    archetypes: ["SAGE", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["forcing", "struggle", "resistance", "flow", "naturalness", "effortless", "non-action", "spontaneity"],
    description: "Achieve goals through alignment with natural flow, not forceful striving",
    application: "Explore if Villain emerges from Hero 'forcing' rather than 'flowing' toward goal"
  },
  
  {
    name: "Buddhist Mindfulness (Vipassana)",
    category: "Eastern",
    archetypes: ["SAGE", "CAREGIVER"],
    barrierTypes: ["internal"],
    keywords: ["suffering", "attachment", "aversion", "impermanence", "craving", "mindfulness", "awareness", "dukkha"],
    description: "Observe Villain (suffering) without attachment; see its impermanent nature",
    application: "Practice: What happens if Hero stops resisting Villain? What remains?"
  },
  
  {
    name: "Zen Koans",
    category: "Eastern",
    archetypes: ["SAGE", "JESTER", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["paradox", "logical impossibility", "breakthrough", "koan", "non-dual", "enlightenment"],
    description: "Use paradoxical questions to break linear thinking blocking insight",
    application: "Pose koan: 'What is the sound of one hand clapping?' adapted to Hero-Villain context"
  },
  
  {
    name: "Human Design (Energy Types)",
    category: "Eastern",
    archetypes: ["ALL"],
    barrierTypes: ["internal"],
    keywords: ["energy", "strategy", "authority", "conditioning", "generator", "projector", "manifestor", "reflector"],
    description: "Align action with energetic design (Generator, Projector, Manifestor, Reflector)",
    application: "Determine if Villain arises from acting against natural energy type"
  },
  
  {
    name: "Enneagram (9 Personality Types)",
    category: "Eastern",
    archetypes: ["ALL"],
    barrierTypes: ["internal"],
    keywords: ["type 1", "type 2", "type 3", "type 4", "type 5", "type 6", "type 7", "type 8", "type 9", "perfectionism", "people-pleasing", "image", "anxiety"],
    description: "Identify core personality fixation creating the Villain pattern",
    application: "Match Villain to Enneagram type (e.g., Perfectionism = Type 1, Fear of failure = Type 6)"
  },
  
  {
    name: "Vedanta (Non-Duality)",
    category: "Eastern",
    archetypes: ["SAGE", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["non-duality", "atman", "brahman", "illusion", "maya", "self-realization", "witness consciousness"],
    description: "Recognize Hero and Villain as illusory constructs; realize underlying unity",
    application: "Shift from 'I am Hero fighting Villain' to 'I am awareness witnessing this dynamic'"
  },
  
  {
    name: "Yoga Philosophy (8 Limbs)",
    category: "Eastern",
    archetypes: ["CAREGIVER", "SAGE", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["discipline", "practice", "yamas", "niyamas", "self-restraint", "purification", "union"],
    description: "Progress through 8 limbs (ethical restraints -> meditation) to transcend Villain",
    application: "Map Hero's goal to higher limbs (dharana/dhyana); Villain as violations of yamas/niyamas"
  },
  
  {
    name: "Confucian Virtue Ethics",
    category: "Eastern",
    archetypes: ["RULER", "CAREGIVER", "SAGE"],
    barrierTypes: ["internal", "external"],
    keywords: ["virtue", "benevolence", "righteousness", "ritual", "filial piety", "harmony", "jen", "li"],
    description: "Cultivate virtues (ren, li, yi) that dissolve Villain through harmonious relationships",
    application: "If Villain involves social conflict, apply Confucian relational ethics"
  },
  
  {
    name: "Tibetan Buddhism (Tonglen)",
    category: "Eastern",
    archetypes: ["CAREGIVER", "HERO", "SAGE"],
    barrierTypes: ["internal"],
    keywords: ["compassion", "suffering", "tonglen", "give and take", "bodhicitta", "loving-kindness"],
    description: "Breathe in Villain (suffering), breathe out compassion for self and others",
    application: "Transform Villain through compassion practice: inhale the barrier, exhale healing"
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // BUSINESS & STRATEGY (10 frameworks)
  // ═══════════════════════════════════════════════════════════════════════
  
  {
    name: "Blue Ocean Strategy",
    category: "Business",
    archetypes: ["CREATOR", "RULER", "HERO"],
    barrierTypes: ["external"],
    keywords: ["competition", "market", "differentiation", "red ocean", "value innovation", "uncontested"],
    description: "Create uncontested market space instead of competing in saturated markets",
    application: "If Villain is competitive market, explore what value curve shifts create blue ocean"
  },
  
  {
    name: "Jobs-to-be-Done (JTBD)",
    category: "Business",
    archetypes: ["CREATOR", "HERO"],
    barrierTypes: ["external"],
    keywords: ["customer needs", "problem-solution fit", "hiring products", "functional job", "emotional job"],
    description: "Understand what 'job' customers hire your solution to do",
    application: "Reframe Hero's goal as job-to-be-done; Villain as current inadequate solution"
  },
  
  {
    name: "Lean Canvas",
    category: "Business",
    archetypes: ["CREATOR", "RULER"],
    barrierTypes: ["external"],
    keywords: ["business model", "problem", "solution", "channels", "revenue", "customer segments"],
    description: "Map business model on 9-block canvas to identify weak links",
    application: "Place Villain in 'Problem' or 'Unfair Advantage' block; Hero in 'Solution'"
  },
  
  {
    name: "Design Thinking (IDEO)",
    category: "Business",
    archetypes: ["CREATOR", "EXPLORER"],
    barrierTypes: ["internal", "external"],
    keywords: ["prototyping", "iteration", "empathy", "testing", "overthinking", "bias to action", "human-centered"],
    description: "Bypass overthinking (Villain) through rapid prototyping and user feedback",
    application: "If Villain is perfectionism/paralysis, use Design Thinking's 'bias toward action'"
  },
  
  {
    name: "Lean Startup (Build-Measure-Learn)",
    category: "Business",
    archetypes: ["CREATOR", "HERO"],
    barrierTypes: ["external"],
    keywords: ["MVP", "pivot", "validated learning", "uncertainty", "hypothesis", "experiment"],
    description: "Reduce uncertainty (Villain) through smallest testable experiments",
    application: "Frame Hero's goal as hypothesis; Villain as assumption to test"
  },
  
  {
    name: "TRIZ (40 Inventive Principles)",
    category: "TRIZ",
    archetypes: ["CREATOR", "MAGICIAN", "RULER"],
    barrierTypes: ["external", "internal"],
    keywords: ["contradiction", "constraint", "technical problem", "innovation", "inventive principles", "system conflict"],
    description: "Resolve contradictions using systematic inventive principles",
    application: "Formulate Hero-Villain as technical contradiction (X improves but Y worsens); apply principles"
  },
  
  {
    name: "Theory of Constraints (TOC)",
    category: "Business",
    archetypes: ["RULER", "HERO", "CREATOR"],
    barrierTypes: ["external"],
    keywords: ["bottleneck", "constraint", "throughput", "system optimization", "limiting factor"],
    description: "Identify the single bottleneck (Villain) constraining entire system (Hero)",
    application: "Find which ONE barrier, if removed, would unleash Hero's full potential"
  },
  
  {
    name: "Wardley Mapping",
    category: "Business",
    archetypes: ["RULER", "SAGE", "MAGICIAN"],
    barrierTypes: ["external"],
    keywords: ["strategic landscape", "evolution", "value chain", "situational awareness", "positioning"],
    description: "Map strategic landscape to see where Hero and Villain sit in evolution",
    application: "Plot Hero's goal and Villain on evolution axis (genesis -> commodity); identify movement"
  },
  
  {
    name: "Jobs Theory (Clayton Christensen)",
    category: "Business",
    archetypes: ["CREATOR", "HERO", "RULER"],
    barrierTypes: ["external"],
    keywords: ["disruption", "innovation", "jobs to be done", "customer progress", "hiring", "firing"],
    description: "Understand progress customers seek (Hero) vs. obstacles in current solution (Villain)",
    application: "Map what job Hero wants to complete; what current solution (Villain) fails to deliver"
  },
  
  {
    name: "OKRs (Objectives and Key Results)",
    category: "Business",
    archetypes: ["RULER", "HERO"],
    barrierTypes: ["external", "internal"],
    keywords: ["objectives", "key results", "measurable", "alignment", "focus", "goals"],
    description: "Structure Hero as Objective; measure progress despite Villain through Key Results",
    application: "Define Hero as Objective (qualitative); break into Key Results; track Villain's impact"
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // ESOTERIC & SYMBOLIC (5 frameworks)
  // ═══════════════════════════════════════════════════════════════════════
  
  {
    name: "Tarot (Major Arcana)",
    category: "Esoteric",
    archetypes: ["ALL"],
    barrierTypes: ["internal", "external"],
    keywords: ["journey", "transformation", "archetypes", "symbolism", "fool", "magician", "tower", "cards"],
    description: "Map Hero's journey to Major Arcana cards (Fool -> World); Villain as challenging cards",
    application: "Identify which Tarot card represents Hero (e.g., The Magician for CREATOR) and Villain (e.g., The Tower for sudden disruption)"
  },
  
  {
    name: "Astrology (Natal Chart)",
    category: "Esoteric",
    archetypes: ["ALL"],
    barrierTypes: ["internal"],
    keywords: ["timing", "planetary transits", "aspects", "houses", "zodiac", "birth chart", "planets"],
    description: "Use astrological timing to understand when Villain is strongest and when Hero has advantage",
    application: "If user provides birth data, analyze current transits affecting Hero-Villain dynamic"
  },
  
  {
    name: "Kabbalah (Tree of Life)",
    category: "Esoteric",
    archetypes: ["SAGE", "MAGICIAN"],
    barrierTypes: ["internal"],
    keywords: ["spiritual path", "sephirot", "emanations", "tree of life", "mysticism", "divine"],
    description: "Map Hero's goal to higher sephirot (Keter/Crown); Villain as blockage in middle pillar",
    application: "Explore which sephirah Hero aspires to and which one Villain traps them in"
  },
  
  {
    name: "Numerology (Life Path)",
    category: "Esoteric",
    archetypes: ["ALL"],
    barrierTypes: ["internal"],
    keywords: ["destiny", "life path", "numbers", "vibration", "birth date", "numerological"],
    description: "Calculate life path number to understand Hero's core purpose; Villain as karmic lesson",
    application: "If user provides birth date, calculate life path and explain how Villain serves growth"
  },
  
  {
    name: "Hermetic Principles (Kybalion)",
    category: "Esoteric",
    archetypes: ["MAGICIAN", "SAGE"],
    barrierTypes: ["internal", "external"],
    keywords: ["mentalism", "correspondence", "vibration", "polarity", "rhythm", "cause and effect", "gender", "hermetic"],
    description: "Apply 7 Hermetic Principles (Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause/Effect, Gender)",
    application: "Use Polarity: Hero and Villain are opposite poles of same thing; shift position on spectrum"
  },
  
  // ═══════════════════════════════════════════════════════════════════════
  // TRIZ SPECIFIC (3 frameworks)
  // ═══════════════════════════════════════════════════════════════════════
  
  {
    name: "TRIZ Contradiction Matrix",
    category: "TRIZ",
    archetypes: ["CREATOR", "RULER", "MAGICIAN"],
    barrierTypes: ["external", "hybrid"],
    keywords: ["contradiction", "39 parameters", "improving parameter", "worsening parameter", "technical contradiction"],
    description: "Map Hero (improving parameter) vs Villain (worsening parameter) to 39x39 matrix for inventive principles",
    application: "Identify which of 39 parameters Hero improves and Villain worsens; consult matrix"
  },
  
  {
    name: "TRIZ Su-Field Analysis",
    category: "TRIZ",
    archetypes: ["MAGICIAN", "CREATOR"],
    barrierTypes: ["external"],
    keywords: ["substance", "field", "interaction", "su-field", "vepol", "system components"],
    description: "Model Hero-Villain as Substance-Field interaction; identify missing elements",
    application: "S1 (Hero's tool), S2 (Villain's object), F (interaction field); complete or transform su-field"
  },
  
  {
    name: "TRIZ Resource Analysis",
    category: "TRIZ",
    archetypes: ["CREATOR", "RULER", "HERO"],
    barrierTypes: ["external", "internal"],
    keywords: ["resources", "material", "energy", "information", "time", "space", "harmful resources", "hidden resources"],
    description: "Identify available resources (material, field, time, info, space) to overcome Villain",
    application: "List all resources in operational zone; use Villain itself as resource (convert harm to benefit)"
  }
];

// ============================================================================
// MATCHING ALGORITHMS
// ============================================================================

/**
 * Detect Hero's archetype from text description
 */
export function detectArchetype(heroText: string): ArchetypeType {
  const lowerText = heroText.toLowerCase();
  
  const scores = ARCHETYPES.map(archetype => {
    const matchCount = archetype.keywords.filter(keyword => 
      lowerText.includes(keyword)
    ).length;
    
    return {
      archetype: archetype.name,
      score: matchCount
    };
  });
  
  scores.sort((a, b) => b.score - a.score);
  
  // If top score is 0, default to CREATOR (most common for startup/business context)
  return scores[0].score > 0 ? scores[0].archetype : "CREATOR";
}

/**
 * Classify Villain's barrier type
 */
export function classifyBarrierType(villainText: string): BarrierType {
  const lowerText = villainText.toLowerCase();
  
  const internalKeywords = [
    "fear", "anxiety", "perfectionism", "doubt", "imposter", "procrastination",
    "overthinking", "insecurity", "shame", "guilt", "self-sabotage", "burnout",
    "paralysis", "indecision", "overwhelm"
  ];
  
  const externalKeywords = [
    "money", "time", "resources", "budget", "market", "competition", "regulation",
    "bureaucracy", "technology", "infrastructure", "access", "network", "capital",
    "team", "skills", "expertise"
  ];
  
  const internalScore = internalKeywords.filter(kw => lowerText.includes(kw)).length;
  const externalScore = externalKeywords.filter(kw => lowerText.includes(kw)).length;
  
  if (internalScore > externalScore * 1.5) return "internal";
  if (externalScore > internalScore * 1.5) return "external";
  return "hybrid";
}

/**
 * Calculate match score for a single framework
 */
function calculateFrameworkScore(
  framework: Framework,
  heroArchetype: ArchetypeType,
  villainBarrierType: BarrierType,
  villainText: string
): number {
  let score = 0;
  
  // 1. Archetype match (40% weight)
  if (framework.archetypes.includes(heroArchetype) || framework.archetypes.includes("ALL")) {
    score += 0.4;
  }
  
  // 2. Barrier type match (30% weight)
  if (framework.barrierTypes.includes(villainBarrierType)) {
    score += 0.3;
  }
  
  // 3. Keyword match (30% weight)
  const lowerVillainText = villainText.toLowerCase();
  const keywordMatches = framework.keywords.filter(keyword =>
    lowerVillainText.includes(keyword)
  ).length;
  
  const keywordScore = Math.min(keywordMatches / 3, 1); // Cap at 1.0 for 3+ matches
  score += keywordScore * 0.3;
  
  return score;
}

/**
 * Match top 3 frameworks for Hero-Villain dynamic
 */
export function matchFrameworks(
  heroArchetype: ArchetypeType,
  villainBarrierType: BarrierType,
  villainText: string
): Framework[] {
  
  const scoredFrameworks = FRAMEWORKS.map(framework => ({
    framework,
    score: calculateFrameworkScore(framework, heroArchetype, villainBarrierType, villainText)
  }));
  
  // Sort by score descending
  scoredFrameworks.sort((a, b) => b.score - a.score);
  
  // Return top 3
  return scoredFrameworks.slice(0, 3).map(sf => sf.framework);
}

/**
 * Main entry point: Match frameworks from Hero + Villain text
 */
export function analyzeInsight(heroText: string, villainText: string) {
  const heroArchetype = detectArchetype(heroText);
  const villainBarrierType = classifyBarrierType(villainText);
  const matchedFrameworks = matchFrameworks(heroArchetype, villainBarrierType, villainText);
  
  return {
    hero: {
      text: heroText,
      archetype: heroArchetype,
      driver: ARCHETYPES.find(a => a.name === heroArchetype)?.driver || "Unknown"
    },
    villain: {
      text: villainText,
      barrierType: villainBarrierType
    },
    frameworks: matchedFrameworks.map(fw => ({
      name: fw.name,
      category: fw.category,
      why: fw.application
    }))
  };
}
