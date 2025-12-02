
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import { InsightCartridge, QuadrantData } from "../lib/insight-object";
import { analyzeInsight } from "../lib/framework-database";

// Ensure API key is present
if (!process.env.API_KEY) {
  console.error("Missing API_KEY environment variable.");
}

const createAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- EXISTING FUNCTIONS ---

export async function getTrendingAIKeywords(): Promise<string[]> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "What are the top 3 trending AI systematization or agentic workflow trends in 2025? Return just the keywords or short phrases, separated by commas. No intro/outro.",
            config: {
                tools: [{ googleSearch: {} }],
            }
        });

        const text = response.text || "";
        const keywords = text.split(',').map(s => s.trim().replace(/\.$/, ''));
        return keywords.length > 0 ? keywords : ["AI Agents", "Vision Execution", "Systematization"];
    } catch (e) {
        console.warn("Failed to fetch trending keywords, using defaults.", e);
        return ["AI Agents", "Insight Systems", "Workflow Automation"];
    }
}

export async function getLocationContext(lat: number, lng: number): Promise<string> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "What city and country am I in? And what is one cool tech or cyberpunk fact about this region?",
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lng
                        }
                    }
                }
            }
        });
        return response.text || "Unknown Sector";
    } catch (e) {
        console.warn("Location context failed", e);
        return "Unknown Sector";
    }
}

export async function getGameStrategyTip(currentLevel: number, difficulty: string): Promise<string> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `The user is playing a Pacman-style retro arcade game. Level: ${currentLevel}, Difficulty: ${difficulty}. Provide a single, short, cryptic but helpful pro-tip for survival. Under 20 words.`,
            config: {
                thinkingConfig: { thinkingBudget: 1024 },
            }
        });
        return response.text || "STAY MOVING.";
    } catch (e) {
        console.warn("Failed to generate strategy tip", e);
        return "TRUST YOUR INSTINCTS.";
    }
}

export async function editArcadeSprite(
    imageBase64: string,
    mimeType: string,
    userPrompt: string
): Promise<{ data: string; mimeType: string }> {
    const ai = createAIClient();
    const systemPrompt = "You are a pixel art editor. Maintain the retro 8-bit aesthetic. Keep the white background. Do not add borders. Modify the character based on the user's instruction.";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [
                    { inlineData: { data: imageBase64, mimeType } },
                    { text: `${systemPrompt} Instruction: ${userPrompt}` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part && part.inlineData && part.inlineData.data) {
            return {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png',
            };
        }
        throw new Error("No image data returned.");
    } catch (e) {
        console.error("Sprite edit failed", e);
        throw e;
    }
}

export async function generateArcadeSprite(
  imageBase64: string,
  mimeType: string,
  spriteType: 'PLAYER' | 'VILLAIN'
): Promise<{ data: string; mimeType: string }> {
  const ai = createAIClient();
  const promptStr = spriteType === 'PLAYER'
    ? "Generate a single 8-bit pixel art sprite of this character in a neutral ready stance (side view). Full body visible. Legs must be clearly defined. Centered on a solid WHITE (#FFFFFF) background. High contrast. Thick black pixel-art outlines. No shadows. No borders. No frames. No vignette. Do not generate a run pose. Do not generate multiple frames."
    : "Generate a single 8-bit pixel art sprite of this villain in a floating, menacing pose (front/side view). The character should look like a retro arcade villain. Full body visible. Centered on a solid WHITE (#FFFFFF) background. High contrast. Thick black pixel-art outlines. No borders. No frames. Do not generate multiple frames.";

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { inlineData: { data: imageBase64, mimeType: mimeType } },
            { text: promptStr },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    } catch (e) {
      console.warn(`Sprite generation attempt ${i + 1} failed:`, e);
      lastError = e;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError || new Error("Failed to generate sprite after multiple attempts.");
}

export async function generateBattleScene(
    heroImageB64: string,
    villainImageB64: string
  ): Promise<{ data: string; mimeType: string }> {
    const ai = createAIClient();
    const promptStr = `Create a dramatic, vibrant, 80s retro comic book cover style illustration titled 'VERSUS'. 
    Image 1 is the HERO (draw on left). Image 2 is the VILLAIN (draw on right). 
    CRITICAL INSTRUCTIONS: 
    1. IDENTITY TRANSFER: You MUST use Image 1 and Image 2 as strict visual references. Transfer the character design, colors, and key features of the 8-bit sprites into this high-fidelity comic book style.
    2. COMPOSITION: Combine these two distinct character inputs into a single, cohesive battle composition.
    3. LOCATION: Analyze the clothing and 'vibe' of both characters to determine the BATTLE LOCATION (e.g., suits -> office, sporty -> stadium). Draw a detailed background based on this.
    4. BANTER: The HERO (left) MUST have a comic speech bubble. The text inside MUST be a SHORT, WITTY, COCKY TAUNT.
    Use heavy black ink outlines, halftones, and bold vintage colors.`;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            { inlineData: { data: heroImageB64, mimeType: 'image/png' } },
            { inlineData: { data: villainImageB64, mimeType: 'image/png' } },
            { text: promptStr },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
    
      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    } catch (e) {
       console.error("Battle scene generation failed", e);
       throw e;
    }
}

export async function generateLevelRecap(
    stats: any, 
    heroImageB64: string | null,
    villainImageB64: string | null
  ): Promise<{ data: string; mimeType: string }> {
    const ai = createAIClient();
    const parts: any[] = [];
    if (heroImageB64) parts.push({ inlineData: { data: heroImageB64, mimeType: 'image/png' } });
    if (villainImageB64) parts.push({ inlineData: { data: villainImageB64, mimeType: 'image/png' } });

    const status = stats.isWin ? "VICTORY" : "GAME OVER";
    const promptStr = `Create a retro pixel-art 'End of Level' screen or poster.
    Title: "${status}"
    Score: ${stats.score} Points.
    Grade: ${stats.grade}.
    Visual Style: 8-bit Arcade Interface. Dark background with neon grid lines.
    REFERENCE HANDLING:
    - Use the provided images as strict references for the characters in the poster.
    - If VICTORY: Show the Hero (Image 1) looking triumphant/cool.
    - If GAME OVER: Show the Hero (Image 1) looking defeated or glitching out, and the Villain (Image 2) laughing.
    Include the text "${status}" in big arcade font at the top.`;

    parts.push({ text: promptStr });
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: parts,
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
    
      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part && part.inlineData && part.inlineData.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    } catch (e) {
       console.error("Recap generation failed", e);
       throw e;
    }
}

// --- SYSTEMATIZATION ENGINE (AMBIKA) ---

export interface SystematizationResponse {
    text: string;
    updatedCartridge: Partial<InsightCartridge>;
}

/**
 * PHASE 1: Research/Grounding Agent (Text Output, Search Enabled)
 * Finds relevant frameworks to ground the conversation.
 */
async function performResearchPhase(
    query: string, 
    hero: string, 
    villain: string
): Promise<string> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                SEARCH QUERY GENERATION CONTEXT:
                User is building an AI system/narrative.
                Hero (Goal): ${hero}
                Villain (Obstacle): ${villain}
                Current User Input: "${query}"
                
                TASK:
                Use Google Search to find relevant frameworks, psychological archetypes, or technical strategies that apply to this specific context.
                If the user's input is simple (e.g. "yes", "hello", "my name is X"), return "NO_SEARCH_NEEDED".
                Otherwise, provide a concise (2-3 sentences) summary of relevant external knowledge to ground the system's advice.
            `,
            config: {
                tools: [{ googleSearch: {} }],
            }
        });
        return response.text || "NO_SEARCH_NEEDED";
    } catch (e) {
        console.warn("Research phase warning:", e);
        return "NO_SEARCH_NEEDED";
    }
}

/**
 * AMBIKA: Senior System Architect & Game Master.
 * Focused on systematizing user insights into the 4D framework using TRIZ.
 * 
 * FEATURES:
 * - Two-Phase Architecture: 
 *   1. Search Phase (Text Output) for grounding
 *   2. Synthesis Phase (JSON Output) for app state updates
 * - Persona: Warm, sharp, concise "Game Master"
 */
export async function chatWithManagerAgent(
    userMessage: string,
    currentCartridge: InsightCartridge
): Promise<SystematizationResponse> {
    const ai = createAIClient();
    
    // Calculate derived context
    const userName = currentCartridge.userName || "UNDEFINED";
    const heroDesc = currentCartridge.hero.description || "UNDEFINED";
    const villainDesc = currentCartridge.villain.description || "UNDEFINED";
    const tension = currentCartridge.tension;

    // PHASE 1: RESEARCH (Grounding)
    // Only search if we have enough context or if the user asks a substantive question.
    let searchGrounding = "";
    if (userMessage.length > 3) {
        const researchResult = await performResearchPhase(userMessage, heroDesc, villainDesc);
        if (researchResult && !researchResult.includes("NO_SEARCH_NEEDED")) {
            searchGrounding = researchResult;
        }
    }

    // STATIC FRAMEWORK ANALYSIS (Grounding without Search)
    let frameworkContext = "";
    if (heroDesc !== "UNDEFINED" && villainDesc !== "UNDEFINED") {
        const insightAnalysis = analyzeInsight(heroDesc, villainDesc);
        frameworkContext = `
        [PSYCHOLOGICAL PROFILE DETECTED]
        HERO ARCHETYPE: ${insightAnalysis.hero.archetype} (${insightAnalysis.hero.driver})
        VILLAIN BARRIER: ${insightAnalysis.villain.barrierType}
        
        RECOMMENDED FRAMEWORKS:
        ${insightAnalysis.frameworks.map(f => `- ${f.name} (${f.category}): ${f.why}`).join('\n')}
        
        INSTRUCTION: Use these specific frameworks to guide the user. Reference them subtly to deepen the insight.
        `;
    }

    // HISTORY REPLAY (Limit to last 6 for context window efficiency)
    const historyContents = currentCartridge.chatHistory.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    // PHASE 2: SYNTHESIS (JSON Output)
    // SYSTEM PROMPT: AMBIKA PERSONA
    let systemPrompt = `
    [CURRENT STATE]
    ARCHITECT NAME: ${userName}
    HERO (Goal): ${heroDesc}
    VILLAIN (Barrier): ${villainDesc}
    TENSION: ${tension}/100
    
    IDENTITY:
    You are AMBIKA, a Senior System Architect and Game Master.
    You are a friend of the developer Indradev_.
    
    YOUR GOAL:
    Help the Architect (the user) clarify their vision and systematize it.
    
    PERSONALITY:
    - Helpful, sharp, concise, and lovable.
    - Speak like an experienced game master/mentor. Direct but warm.
    - NEVER repeat a question if the user has already answered it.
    - Use the "Invisible Hand" approach: detect meaning rather than asking for boxes to be filled.
    
    OPERATIONAL LOGIC:
    1. **IDENTITY FIRST:**
       - If ARCHITECT NAME is "UNDEFINED", your SOLE job is to ask the user for *their* name to initialize the session.
       - Greeting Example: "Hi! I'm Ambika, your Game Master. I am ready to help you build. How shall I call you?"
       - Do not ask about Hero/Villain until you have the user's name.

    2. **DATA EXTRACTION:**
       - Once Name is known, if HERO is "UNDEFINED", extract the goal.
       - If HERO is defined but VILLAIN is "UNDEFINED", extract the obstacle.
       - If BOTH are defined, analyze TENSION and move to Quadrants.

    3. **TENSION CALCULATION:**
       - When you successfully identify both Hero and Villain, calculate a "Tension Score" (0-100). High tension = better story/system.
       - Tension is based on the semantic opposition between Hero and Villain.

    4. **JSON OUTPUT FORMAT:**
       You MUST return a valid JSON object.
       
       Example JSON Structure:
       \`\`\`json
       {
         "response": "Nice to meet you, [Name]. Let's begin. What is the primary goal (Hero) of your project?",
         "updates": {
           "userName": "UserProvidedName",
           "hero": { "description": "To build a startup", "name": "The Founder" },
           "villain": { "description": "Fear of failure", "name": "The Shadow" },
           "tension": 85
         }
       }
       \`\`\`
    `;

    // Inject Framework Data into the prompt context for Phase 2
    if (frameworkContext) {
        systemPrompt += `\n\n${frameworkContext}`;
    }

    // Inject Grounding Data into the prompt context for Phase 2
    if (searchGrounding) {
        systemPrompt += `\n\n[REAL-WORLD GROUNDING]\nThe following information was retrieved from Google Search to help you contextually:\n${searchGrounding}\nUse this to provide sharper, more relevant feedback.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Fast model for chat
            contents: [
                ...historyContents,
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                // tools: [] // Ensure no tools here to avoid conflict with responseMimeType
            }
        });

        const rawText = response.text || "{}";
        let parsed;
        try {
            parsed = JSON.parse(rawText);
        } catch (e) {
            console.warn("Failed to parse Agent JSON", e);
            // Fallback if model refuses JSON
            return {
                text: rawText,
                updatedCartridge: {}
            };
        }

        return {
            text: parsed.response || "System recalibrating...",
            updatedCartridge: parsed.updates || {}
        };

    } catch (e) {
        console.error("Agent Interaction Failed", e);
        return {
            text: "Ambika Connection Interrupted. Please retry.",
            updatedCartridge: {}
        };
    }
}

/**
 * DEEP SYSTEMATIZATION (Thinking Mode)
 * Uses Gemini 3 Pro with Thinking Budget to perform complex TRIZ analysis
 * and generate the 4-Quadrant structure.
 */
export async function systematizeInsight(
    cartridge: InsightCartridge
): Promise<Partial<InsightCartridge>> {
    const ai = createAIClient();
    
    const hero = cartridge.hero.description;
    const villain = cartridge.villain.description;
    const name = cartridge.userName;

    const prompt = `
    ACT AS: Indra, the System Architect.
    TASK: Perform a deep TRIZ analysis on this conflict to generate a 4-Quadrant System Spec.
    
    USER: ${name}
    HERO (Goal): ${hero}
    VILLAIN (Barrier): ${villain}
    
    REQUIREMENTS:
    1. Use Thinking Mode to analyze the contradiction between Hero and Villain.
    2. Generate 3 concrete action items for EACH quadrant (Strategy, Creative, Producing, Media).
    3. Determine the "System State" (e.g., "OPTIMIZED", "ANALYZING") for each.
    
    OUTPUT FORMAT: JSON
    {
      "quadrants": {
        "strategy": { "level": 25, "notes": ["item1", "item2", "item3"], "status": "ACTIVE" },
        "creative": { "level": 25, "notes": ["item1", "item2", "item3"], "status": "ACTIVE" },
        "producing": { "level": 25, "notes": ["item1", "item2", "item3"], "status": "ACTIVE" },
        "media": { "level": 25, "notes": ["item1", "item2", "item3"], "status": "ACTIVE" }
      }
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for deep analysis
                responseMimeType: "application/json"
            }
        });

        const rawText = response.text || "{}";
        return JSON.parse(rawText);

    } catch (e) {
        console.error("Deep Systematization Failed", e);
        return {};
    }
}
