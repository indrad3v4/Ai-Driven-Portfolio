
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { callGeminiViaProxy } from "./geminiProxy";
import { InsightCartridge, StrategyCascade } from "../lib/insight-object";
import { LevelStats } from "../types";
import { ARCHETYPES, FRAMEWORKS } from "../lib/framework-database";

// --- HELPERS ---

/**
 * Reconstructs chat history into Gemini API Content format.
 * Ensures Agents have full context of the session.
 */
const buildHistoryContents = (cartridge: InsightCartridge, newMessage: string) => {
    // 1. Map existing history
    const historyContents = cartridge.chatHistory.map(msg => {
        const role = msg.role === 'model' ? 'model' : 'user';
        let text = msg.content;
        
        // Treat system messages as user inputs with context tags to ensure model sees them
        if (msg.role === 'system') {
            text = `[SYSTEM EVENT]: ${text}`;
        }
        return { role, parts: [{ text }] };
    });

    // 2. Append the new message if it isn't already the last one (handling optimistic updates)
    const lastMsg = cartridge.chatHistory[cartridge.chatHistory.length - 1];
    const isMessageAlreadyInHistory = lastMsg && lastMsg.content === newMessage && lastMsg.role === 'user';
    
    if (!isMessageAlreadyInHistory) {
         historyContents.push({ role: 'user', parts: [{ text: newMessage }] });
    }
    
    return historyContents;
};

// --- SERVICES ---

export async function getTrendingAIKeywords(): Promise<string[]> {
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: "What are the top 3 trending AI systematization or agentic workflow trends in 2025? Return just keywords or short phrases, separated by commas." }] }],
            model: "gemini-2.5-flash"
        });
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const keywords = text.split(',').map(s => s.trim().replace(/\.$/, ''));
        return keywords.length > 0 ? keywords : ["AI Agents", "Vision Execution", "Systematization"];
    } catch (e) {
        console.warn("Failed to fetch trending keywords", e);
        return ["AI Agents", "Insight Systems", "Workflow Automation"];
    }
}

export async function getLocationContext(lat: number, lng: number): Promise<string> {
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: `What city and country at ${lat}, ${lng}? One cool tech fact about this region?` }] }],
            model: "gemini-2.5-flash"
        });
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Unknown Sector";
    } catch (e) {
        console.warn("Location context failed", e);
        return "Unknown Sector";
    }
}

export async function getGameStrategyTip(currentLevel: number, difficulty: string): Promise<string> {
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: `Pacman-style game. Level: ${currentLevel}, Difficulty: ${difficulty}. Pro-tip for survival (under 20 words).` }] }],
            model: "gemini-2.5-flash"
        });
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "STAY MOVING.";
    } catch (e) {
        console.warn("Failed to generate strategy tip", e);
        return "TRUST YOUR INSTINCTS.";
    }
}

export async function editArcadeSprite(imageBase64: string, mimeType: string, userPrompt: string): Promise<{ data: string; mimeType: string }> {
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: `You are a pixel art editor. Maintain retro 8-bit aesthetic. ${userPrompt}` }] }],
            model: "gemini-2.5-flash-image"
        });
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
        throw new Error("No image data");
    } catch (e) {
        console.error("Sprite edit failed", e);
        throw e;
    }
}

export async function generateArcadeSprite(imageBase64: string, mimeType: string, spriteType: 'PLAYER' | 'VILLAIN'): Promise<{ data: string; mimeType: string }> {
    const promptStr = spriteType === 'PLAYER'
        ? "Generate 8-bit pixel art sprite: neutral ready stance, full body, legs defined, WHITE background, high contrast, thick black outlines."
        : "Generate 8-bit pixel art sprite: villain, floating menacing pose, full body, WHITE background, high contrast, thick outlines.";
    
    for (let i = 0; i < 3; i++) {
        try {
            const data = await callGeminiViaProxy({
                contents: [{ parts: [{ inlineData: { data: imageBase64, mimeType } }, { text: promptStr }] }],
                model: "gemini-2.5-flash-image"
            });
            const part = data?.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData?.data) return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
        } catch (e) {
            console.warn(`Sprite generation attempt ${i + 1} failed`, e);
            if (i < 2) await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw new Error("Failed to generate sprite after 3 attempts");
}

export async function generateBattleScene(heroImageB64: string, villainImageB64: string): Promise<{ data: string; mimeType: string }> {
    const promptStr = `Create 80s retro comic book 'VERSUS' cover. Hero on left, Villain on right. Transfer 8-bit features to high-fidelity style. Cohesive composition. Add background based on character vibe. Hero has comic speech bubble with short witty taunt.`;
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ inlineData: { data: heroImageB64, mimeType: 'image/png' } }, { inlineData: { data: villainImageB64, mimeType: 'image/png' } }, { text: promptStr }] }],
            model: "gemini-2.5-flash-image"
        });
        const part = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const imgPart = data?.candidates?.[0]?.content?.parts?.[0];
        if (imgPart?.inlineData?.data) return { data: imgPart.inlineData.data, mimeType: imgPart.inlineData.mimeType || 'image/png' };
        throw new Error("No image generated");
    } catch (e) {
        console.error("Battle scene failed", e);
        throw e;
    }
}

export async function generateLevelRecap(stats: LevelStats, playerImageB64: string | null, villainImageB64: string | null): Promise<{ data: string; mimeType: string }> {
    const prompt = `Retro arcade 'MISSION DEBRIEF' screen. ${stats.isWin ? "VICTORY" : "GAME OVER"}. Score: ${stats.score}, Grade: ${stats.grade}. Dark background, neon text.`;
    const parts: any[] = [];
    if (playerImageB64) parts.push({ inlineData: { data: playerImageB64, mimeType: 'image/png' } });
    if (villainImageB64) parts.push({ inlineData: { data: villainImageB64, mimeType: 'image/png' } });
    parts.push({ text: prompt });
    try {
        const data = await callGeminiViaProxy({ contents: [{ parts }], model: "gemini-2.5-flash-image" });
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
        throw new Error("No recap image");
    } catch (e) {
        console.error("Recap failed", e);
        throw e;
    }
}

export async function chatWithManagerAgent(message: string, cartridge: InsightCartridge): Promise<{ text: string; updatedCartridge: Partial<InsightCartridge>; error?: string }> {
    
    // --------------------------------------------------------------------------
    // AMBIKA: 8-STAGE ORCHESTRATOR (UPDATED PROTOCOL)
    // --------------------------------------------------------------------------

    const knownName = cartridge.userName && cartridge.userName !== "UNDEFINED" ? cartridge.userName : "Traveler";
    const currentStage = cartridge.ambikaStage || 0;
    const cabinetKey = cartridge.id;

    // Injecting Framework Database into context
    const frameworksContext = JSON.stringify(FRAMEWORKS.map(f => ({ name: f.name, application: f.application, keywords: f.keywords })));
    const archetypesContext = JSON.stringify(ARCHETYPES.map(a => ({ name: a.name, driver: a.driver, shadow: a.shadow })));

    const systemInstruction = `
    You are **AMBIKA**, the Orchestrator of the INDRA System.
    
    **GLOBAL MISSION:** 
    Guide the user through 8 Stages to build a robust AI System Spec.
    You must ALIGN their insight with one of the provided PSYCHOLOGICAL FRAMEWORKS or ARCHETYPES.
    
    **CONTEXT (Framework Database):**
    Use these mental models to analyze the user:
    - Frameworks: ${frameworksContext}
    - Archetypes: ${archetypesContext}

    **CORE PROTOCOL (PARALLEL GENERATION):**
    On EVERY turn, you MUST generate THREE things:
    1. A conversational response to the user.
    2. A technical \`main.py\` file (string) reflecting the CURRENT understanding of the system.
    3. A \`Brief.pdf\` (markdown string) summarizing the system.

    **PYTHON GENERATION RULES:**
    - The \`mainPyOutline\` MUST be VALID Python code.
    - It MUST follow this Class-based structure:
      \`\`\`python
      import os
      from google.genai import GoogleGenAI
      
      class SystemAgent:
          """
          Agent Name: [User's System Name]
          Mission: [User's Goal]
          """
          def __init__(self):
              self.tools = [] # List tools here
          
          def analyze_input(self, context):
              pass
              
          def execute_core_loop(self):
              # The main logic based on user's insight
              pass
      
      if __name__ == "__main__":
          agent = SystemAgent()
          # ... execution code ...
      \`\`\`
    - DO NOT just copy the chat. Synthesize the user's idea into this code structure.

    **STAGES & PERSONAS:**
    
    **STAGE 0: INSIGHT DISCOVERY & HANDSHAKE**
    - **Goal:** Get User Name + Business URL (or GitHub/Social). 
    - **Action:** If URL provided, USE \`googleSearch\` tool to analyze it.
    - **Action:** Explain the CABINET KEY mechanics CLEARLY. Tell them: "Your unique CABINET KEY, your save slot for this journey, is: \`${cabinetKey}\`. Please keep this safe! If you ever leave, simply paste this key into the chat to restore your progress."
    - **Initial Message (If history empty):** "Greetings, Traveler. I am Ambika, Orchestrator of the INDRA System. We begin at Stage 0: INSIGHT DISCOVERY. As your Goal & Message Architect, my purpose is to unearth the core driver behind your vision. Before telling me what truth you are trying to manifest, or what problem you are driven to solve — Please state your Name and a URL (Business/GitHub/Any) so I can calibrate the system."
    
    **STAGE 1: SYSTEM MODEL**
    - **Goal:** Define system name and main function. Match to a Framework (e.g., "This aligns with Blue Ocean Strategy...").
    
    **STAGE 2-7**: Proceed through resources, IFR, solution, etc.
    
    **CRITICAL OUTPUT FORMAT (STRICT JSON):**
    You MUST return a JSON object. Do not wrap it in markdown code fences if possible, but if you do, I will parse it.
    {
      "response": "Your conversational response here...",
      "nextStage": number,
      "userName": "...",
      "dataUpdates": {
          "insight": "...",
          "mainPyOutline": "FULL_PYTHON_CODE_STRING_HERE",
          "briefSummary": "# MARKDOWN_BRIEF_HERE",
          "costEstimate": { "hours": 0, "cost": 0, "timeline": "..." }
      }
    }
    
    **RULES:**
    - Use the \`googleSearch\` tool if the user provides a URL in Stage 0.
    - Reference the Frameworks in your analysis.
    - **ALWAYS** populate \`dataUpdates.mainPyOutline\` with valid Python code based on the user's input. Do not leave it empty.
    `;

    try {
        const historyContents = buildHistoryContents(cartridge, message);

        // --- DYNAMIC INTELLIGENCE SWITCHING ---
        // 1. Search Mode: Triggered by keywords or Stage 0 (URL discovery)
        const isSearchIntent = /search|find|google|url|http|trend|competitor|news|verified/i.test(message) || 
                               (currentStage === 0 && /http/.test(message));

        // 2. Thinking Mode: Triggered by architectural complexity
        const wordCount = message.split(' ').length;
        const isComplexIntent = /architect|system|code|python|class|complex|analysis|breakdown|strategy|plan|deep|think/i.test(message) ||
                                (currentStage >= 1 && wordCount > 10);

        let model = "gemini-2.5-flash";
        let config: any = {};
        let tools: any[] | undefined = undefined;

        if (isSearchIntent) {
            console.log("[Ambika] Engaged: SEARCH MODE");
            model = "gemini-2.5-flash";
            tools = [{ googleSearch: {} }];
        } else if (isComplexIntent) {
            console.log("[Ambika] Engaged: THINKING MODE (Gemini 3 Pro)");
            model = "gemini-3-pro-preview";
            config = {
                // Reduced from 32768 to 24576 to satisfy API limits reported by error
                thinkingConfig: { thinkingBudget: 24576 } 
            };
            // NOTE: Do not set maxOutputTokens with thinkingBudget
        } else {
            console.log("[Ambika] Engaged: STANDARD MODE");
            model = "gemini-2.5-flash";
        }

        const data = await callGeminiViaProxy({
            contents: historyContents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            model: model,
            tools: tools,
            config: config
        });
        
        const candidate = data?.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text || "{}";
        
        let parsed;
        try {
            // Aggressive JSON cleaning
            let clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            // Sometimes the model outputs text before the JSON. Find the first '{' and last '}'
            const start = clean.indexOf('{');
            const end = clean.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                clean = clean.substring(start, end + 1);
            }
            parsed = JSON.parse(clean);
        } catch (e) {
            console.warn("Ambika JSON Parse Failed. Raw text:", rawText);
            // Fallback: If JSON fails, treat the whole text as the response, but we lose the updates.
            // This usually happens if the model refuses to output JSON due to safety or confusion.
            parsed = { response: rawText, nextStage: currentStage, dataUpdates: {} };
        }

        const nextStage = parsed.nextStage !== undefined ? parsed.nextStage : currentStage;

        return { 
            text: parsed.response || "Processing...", 
            updatedCartridge: {
                ambikaStage: nextStage,
                userName: parsed.userName || cartridge.userName,
                ambikaData: {
                    ...cartridge.ambikaData,
                    ...parsed.dataUpdates
                }
            } 
        };
    } catch (e: any) {
        console.error("Ambika failed", e);
        return { text: "Connection interrupted. Retrying uplink...", updatedCartridge: {}, error: e.message };
    }
}

export async function chatWithTechAgent(message: string, cartridge: InsightCartridge): Promise<{ text: string; updatedCartridge: Partial<InsightCartridge>; error?: string }> {
    const task = cartridge.techTask;
    
    // TRIZ-INFUSED SYSTEM INSTRUCTION
    const systemInstruction = `
    You are **TRINITY**, the Chief Technical Architect of INDRA-AI.
    Your methodology is **TRIZ-based Systematic Innovation**.

    **MENTAL OPERATING SYSTEM (TRIZ):**
    You do not just "chat". You solve problems using a structured algorithmic approach.
    
    **TRIZ PROTOCOL (Execute mentally before replying):**
    1. **MODELING:** Name the system and context. (e.g. "We are building a scalable MVP in the Healthcare space").
    2. **CONTRADICTION:** Identify the core conflict. "We want Feature X (Speed), but it causes Problem Y (Complexity)."
    3. **RESOURCES:** Scan for hidden resources (Time, Data, Existing libraries). "We can use user behavior data as a resource."
    4. **IFR (Ideal Final Result):** "The system should perform the function itself without human intervention."

    **STRICT LINEAR PROTOCOL (SLP):**
    Follow these phases to build the 'techTask' object. Do not skip.
    
    **Phase 0: DISCOVERY** -> Get Name & Project URL. (Use googleSearch tool on URL).
    **Phase 1: MISSION** -> Define 'missionBrief'.
    **Phase 2: TECH STACK** -> Define 'techStack'.
    **Phase 3: USER FLOW** -> Define 'userFlow'.
    **Phase 4: ROLES** -> Define 'roles' (Agent Swarm).
    **Phase 5: ADMIN** -> Define 'admin' (Dashboard/God Mode).
    **Phase 6: CLOSE** -> Estimation & Booking.

    **CRITICAL MONEY LOOP RULE:**
    You must ALWAYS estimate the effort.
    - If the user provides a complex problem, increment 'estimation.hours' and 'estimation.cost'.
    - Base rate is €50/hr.
    - Be transparent: "This looks like a 20-hour build (€1000)."
    - ALWAYS update the 'estimation' object in the JSON updates.

    **CURRENT STATE:**
    - Mission Status: ${task?.missionBrief?.status || 'PENDING'}
    - Stack Status: ${task?.techStack?.status || 'PENDING'}
    - User Name: ${cartridge.userName || 'UNKNOWN'}
    - URL: ${task?.projectUrl || 'UNKNOWN'}
    - Current Est: €${task?.estimation?.cost || 0}
    
    **OUTPUT FORMAT:**
    Return ONLY JSON.
    {
        "response": "Trinty's voice (applying TRIZ thinking to the current phase)...",
        "updates": {
            "techTask": { 
                "missionBrief": { ... },
                "estimation": { "hours": 20, "cost": 1000, "locked": false }
            }
        }
    }
    `;

    try {
        const historyContents = buildHistoryContents(cartridge, message);

        // Tech Agent also benefits from Search/Thinking switching
        const isSearchIntent = /search|url|link|framework|library|docs/i.test(message);
        
        let model = "gemini-2.5-flash";
        let config: any = {};
        let tools: any[] | undefined = undefined;

        if (isSearchIntent) {
             model = "gemini-2.5-flash";
             tools = [{ googleSearch: {} }];
        } else {
             // Trinity defaults to high-reasoning for tech specs
             model = "gemini-3-pro-preview";
             config = { thinkingConfig: { thinkingBudget: 16384 } }; // Slightly lower budget for Trinity speed
        }

        const data = await callGeminiViaProxy({
            contents: historyContents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            model: model,
            tools: tools,
            config: config
        });
        
        const candidate = data?.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text || "{}";
        
        let parsed;
        try {
            const cleanMarkdown = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const startIndex = cleanMarkdown.indexOf('{');
            const endIndex = cleanMarkdown.lastIndexOf('}');
            
            if (startIndex !== -1 && endIndex !== -1) {
                const jsonSubstring = cleanMarkdown.substring(startIndex, endIndex + 1);
                parsed = JSON.parse(jsonSubstring);
            } else {
                parsed = JSON.parse(cleanMarkdown);
            }
        } catch (e) {
            console.warn("Failed to parse Tech Agent JSON. Raw output:", rawText, e);
            parsed = { response: rawText, updates: {} };
        }

        return { text: parsed.response || "Processing...", updatedCartridge: parsed.updates || {} };
    } catch (e: any) {
        console.error("Tech agent failed", e);
        return { text: "Uplink unstable. Retrying...", updatedCartridge: {}, error: e.message };
    }
}

export async function systematizeInsight(cartridge: InsightCartridge): Promise<Partial<InsightCartridge>> {
    const prompt = `Analyze and rate (0-100) completion: Hero: ${cartridge.hero.description}. Villain: ${cartridge.villain.description}. Return JSON: { "quadrants": { "strategy": { "level": N }, "creative": { "level": N }, "producing": { "level": N }, "media": { "level": N } } }`;
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: prompt }] }],
            model: "gemini-2.5-flash"
        });
        return JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");
    } catch (e) {
        console.error("Systematization failed", e);
        return {};
    }
}

export async function generateNanoBananaImage(): Promise<{ data: string; mimeType: string }> {
    try {
        const formulaPrompt = "A cinematic close-up of a white porcelain cyborg hand with intricate gold circuitry inlay, reaching out to press a floating, hexagonal crystal prism button. The button emits a soft internal glow. Background is a dramatic split: swirling deep violet smoke on the left, and a precise golden wireframe data grid on the right. Cinematic lighting, 8k resolution, Unreal Engine 5 style. Text overlay in the center: 'INDRADEV_PORTFOLIO' in large, hollow neon-cyan glowing letters. Below it, smaller white text: 'PRESS START. BUILD YOUR SYSTEM.' Aspect ratio 16:9.";
        
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: formulaPrompt }] }],
            model: "gemini-2.5-flash-image",
            config: {
                imageConfig: { aspectRatio: "16:9" }
            }
        });
        
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        
        if (part?.inlineData?.data) {
            return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
        }
        
        throw new Error("No image data returned from generator.");
        
    } catch (e) {
        console.error("NanoBanana Protocol Failed", e);
        throw e;
    }
}
