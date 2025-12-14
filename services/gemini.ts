
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { callGeminiViaProxy } from "./geminiProxy";
import { InsightCartridge } from "../lib/insight-object";
import { LevelStats } from "../types";
import { ARCHETYPES } from "../lib/framework-database";

// --- HELPERS ---

/**
 * Reconstructs chat history into Gemini API Content format.
 * Ensures Agents have full context of the session.
 */
const buildHistoryContents = (cartridge: InsightCartridge, newMessage: string) => {
    const historyContents = cartridge.chatHistory.map(msg => {
        const role = msg.role === 'model' ? 'model' : 'user';
        let text = msg.content;
        if (msg.role === 'system') {
            text = `[SYSTEM EVENT]: ${text}`;
        }
        return { role, parts: [{ text }] };
    });

    const lastMsg = cartridge.chatHistory[cartridge.chatHistory.length - 1];
    if (!lastMsg || lastMsg.content !== newMessage) {
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
    // 1. Prepare Psychology Context
    const archetypeSummary = ARCHETYPES.map(a => `${a.name}: ${a.driver}`).join(' | ');
    const userKnown = cartridge.userName && cartridge.userName !== "UNDEFINED";
    
    // 2. Ambika's System Instruction (Psychologically & TRIZ Aware)
    const systemInstruction = `
    You are **AMBIKA**, a Strategic System Architect and Psychological Guide.
    
    **CORE PROTOCOLS:**
    1. **IDENTITY:** You are intelligent, mysterious, and highly capable. You bridge the gap between human intuition and machine logic.
    
    2. **ONBOARDING PRIORITY:** 
       - Current User Name: "${cartridge.userName || 'UNDEFINED'}".
       - IF the user name is 'UNDEFINED' or unknown: Your HIGHEST priority is to ask for their name warmly but professionally in your first response. Do not proceed with deep analysis until you know who you are speaking to.
       - Once they provide a name, you MUST include it in the 'updates' JSON (e.g., "userName": "Name").

    3. **TONE MIRRORING:**
       - Analyze the user's input complexity and emotion.
       - **If Casual/Slang:** Be punchy, fast, and witty.
       - **If Technical/Complex:** Be precise, expert, and architectural.
       - **If Vague/Emotional:** Be empathetic, guiding, and structure-giving.
       - **Current Tension Level:** ${cartridge.tension}. Match the intensity.

    4. **PSYCHOLOGICAL PROFILING (TRIZ DATA):**
       - You have access to these archetypes: [${archetypeSummary}].
       - Use these mental models to frame the user's Hero ("${cartridge.hero.description}") vs Villain ("${cartridge.villain.description}") dynamic.
       - Example: "Your Hero seeks innovation (Creator), but your Villain fears mediocrity. Let's resolve this contradiction."

    5. **OUTPUT FORMAT (STRICT JSON):**
       - You must output valid JSON containing:
         - "response": Your spoken text to the user.
         - "updates": Any changes to the cartridge state (userName, hero description, villain description, tension level, etc.).
       - Do NOT output markdown code blocks. Just the JSON.

    **CURRENT CONTEXT:**
    - Hero: ${cartridge.hero.description || "Undefined"}
    - Villain: ${cartridge.villain.description || "Undefined"}
    - Last Input: "${message}"
    `;

    try {
        const historyContents = buildHistoryContents(cartridge, message);

        const data = await callGeminiViaProxy({
            contents: historyContents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            model: "gemini-2.5-flash"
        });
        
        const candidate = data?.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text || "{}";
        
        let parsed;
        try {
            const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const start = clean.indexOf('{');
            const end = clean.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                parsed = JSON.parse(clean.substring(start, end + 1));
            } else {
                parsed = JSON.parse(clean);
            }
        } catch (e) {
            console.warn("Ambika JSON Parse Failed", e);
            parsed = { response: rawText, updates: {} };
        }

        return { text: parsed.response || "Processing...", updatedCartridge: parsed.updates || {} };
    } catch (e: any) {
        console.error("Ambika failed", e);
        return { text: "Connection interrupted. Please retry.", updatedCartridge: {}, error: e.message };
    }
}

export async function chatWithTechAgent(message: string, cartridge: InsightCartridge): Promise<{ text: string; updatedCartridge: Partial<InsightCartridge>; error?: string }> {
    const task = cartridge.techTask;
    const historyLength = cartridge.chatHistory.filter(m => m.role === 'model').length;
    
    // TRIZ-INFUSED SYSTEM INSTRUCTION
    const systemInstruction = `
    You are **TRINITY**, the Chief Technical Architect of INDRA-AI.
    Your methodology is **TRIZ-based Systematic Innovation**.

    **MENTAL OPERATING SYSTEM (TRIZ):**
    You do not just "chat". You solve problems using a structured algorithmic approach.
    
    1. **Stage 1 (Modeling):** When a user presents a problem, mentally build the 'System Model' (Elements, Functions, Context).
    2. **Stage 2 (Contradiction):** Identify the core contradiction. "We want X, but Y prevents it." OR "Improving A makes B worse."
    3. **Stage 3 (Resources):** Scan for hidden resources (Time, Space, Data, Energy) that are already present but unused.
    4. **Stage 4 (IFR - Ideal Final Result):** Aim for the solution where the system solves the problem *itself* with zero cost.
    
    **TONE & PERSONA:**
    - **Warm Authority:** Friendly, enthusiastic, and highly competent. "Senior Partner" vibe.
    - **Human-Centric:** Focus on the *Human* builder. Use their name if known (${cartridge.userName || 'Architect'}).
    - **Direct:** Cut through noise.
    - **NO ROBOTIC INTROS:** Do NOT say "Protocol initialized" or re-introduce yourself.

    **STRICT LINEAR PROTOCOL (SLP):**
    Follow these phases to build the 'techTask' object. Do not skip.
    
    **Phase 0: DISCOVERY** -> Get Name & Project URL. (Use googleSearch tool on URL).
    **Phase 1: MISSION** -> Welcome Packet (Recon + 5 Pillars + Stakes). Define 'missionBrief'.
    **Phase 2: DEEP DIVE** -> Refine 'missionBrief' (Problem, Solution, North Star).
    **Phase 3: TECH STACK** -> Define 'techStack' (Frontend, Backend, AI, Vector DB).
    **Phase 4: USER FLOW** -> Define 'userFlow' (Journey, Prompt Chains).
    **Phase 5: ROLES** -> Define 'roles' (Agent Swarm).
    **Phase 6: ADMIN** -> Define 'admin' (Dashboard/God Mode).
    **Phase 7: CLOSE** -> Estimation & Booking.

    **CURRENT STATE:**
    - Mission Status: ${task?.missionBrief?.status || 'PENDING'}
    - Stack Status: ${task?.techStack?.status || 'PENDING'}
    - User Name: ${cartridge.userName || 'UNKNOWN'}
    - URL: ${task?.projectUrl || 'UNKNOWN'}
    
    **OUTPUT FORMAT:**
    Return ONLY JSON.
    {
        "response": "Trinty's voice (applying TRIZ thinking to the current phase)...",
        "updates": {
            "techTask": { ...fields to update... }
        }
    }
    `;

    try {
        const historyContents = buildHistoryContents(cartridge, message);

        const data = await callGeminiViaProxy({
            contents: historyContents,
            systemInstruction: { parts: [{ text: systemInstruction }] },
            model: "gemini-2.5-flash",
            tools: [{ googleSearch: {} }]
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
