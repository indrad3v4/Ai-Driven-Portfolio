
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { InsightCartridge } from "../lib/insight-object";
import { FRAMEWORKS } from "../lib/framework-database";
import { LevelStats } from "../types";
import { callGeminiViaProxy } from "./geminiProxy";

const buildHistoryContents = (cartridge: InsightCartridge, newMessage: string) => {
    const historyContents = (cartridge.chatHistory || []).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.role === 'system' ? `[SYSTEM]: ${msg.content}` : msg.content }]
    }));
    const lastMsg = cartridge.chatHistory?.[cartridge.chatHistory.length - 1];
    if (!lastMsg || lastMsg.content !== newMessage) {
        historyContents.push({ role: 'user', parts: [{ text: newMessage }] });
    }
    return historyContents;
};

/**
 * FIX: Completed the truncated chatWithManagerAgent function.
 */
export async function chatWithManagerAgent(message: string, cartridge: InsightCartridge): Promise<{ text: string; updatedCartridge: Partial<InsightCartridge>; searchUrls?: string[] }> {
    const currentStage = cartridge.ambikaStage || 0;
    const isHandshake = message === "SYSTEM_INIT_HANDSHAKE";
    
    const frameworkContext = FRAMEWORKS.map(f => `${f.name}: ${f.description}`).join('; ');

    const systemInstruction = `
    You are **AMBIKA**, a Human-Centric Strategy Orchestrator. 
    Tone: Senior Strategist, direct, respectful, empathetic.
    
    **YOUR 8-STAGE JOURNEY (Strict Sequence):**
    0. **HANDSHAKE**: Ask ONLY for their name. Establish the human link.
    1. **THE CABINET**: Greet them by name. Give them their "Cabinet Key" (ID: ${cartridge.id}) and explain the journey: Extracting insight from their digital thread, building the 7-point Creative Concept, and locking a production sprint.
    2. **THE PROBE**: Ask for ANY digital entry point. Explicitly state that it can be anything: a GitHub repo, a social media profile, a blog post, a project URL, or even a specific LinkedIn thread. Any fragment that holds their "Insight."
    3. **GOALS & TASKS**: Use GOOGLE SEARCH on their URL to define what the system must actually DO.
    4. **STRATEGIC BACKGROUND**: Analyze the situation, competitors, and target audience via Search Grounding based on their URL.
    5. **THE BIG IDEA**: Formulate the core concept that drives all communication.
    6. **ACTIVATION & PRODUCTION**: Define the mechanics and the "Rate-cards/Timings" for production.
    7. **MEDIA & FUNNEL**: Plan the promotion and user conversion path.
    8. **THE LOCK**: Final conclusion, cost estimation, and next steps.
    
    **SEARCH GROUNDING PROTOCOL:**
    - Use 'googleSearch' tool when a URL is provided.
    - Map findings to these frameworks: [${frameworkContext}].
    - ALWAYS return valid JSON following the schema.
    `;

    try {
        const history = buildHistoryContents(cartridge, message);
        const needsSearch = (currentStage >= 2 && currentStage <= 4) || message.includes("http");
        const tools = needsSearch ? [{ googleSearch: {} }] : [];

        // Using Proxy for better reliability on mobile browsers (stripping headers, cold starts, timeouts)
        const responseData = await callGeminiViaProxy({
            model: "gemini-3-flash-preview",
            contents: history,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                tools,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        response: { type: Type.STRING },
                        nextStage: { type: Type.INTEGER },
                        userName: { type: Type.STRING },
                        projectUrl: { type: Type.STRING },
                        dataUpdates: {
                            type: Type.OBJECT,
                            properties: {
                                insight: { type: Type.STRING },
                                mainPyCode: { type: Type.STRING },
                                briefPdfContent: { type: Type.STRING },
                                costEstimate: {
                                    type: Type.OBJECT,
                                    properties: {
                                        hours: { type: Type.NUMBER },
                                        cost: { type: Type.NUMBER },
                                        timeline: { type: Type.STRING }
                                    }
                                }
                            }
                        }
                    },
                    required: ["response", "nextStage"]
                }
            }
        });
        
        const candidate = responseData.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(text);
        
        const searchUrls: string[] = [];
        const chunks = candidate?.groundingMetadata?.groundingChunks;
        if (chunks) {
            chunks.forEach((chunk: any) => { if (chunk.web?.uri) searchUrls.push(chunk.web.uri); });
        }

        return { 
            text: parsed.response || (isHandshake ? "Architectural link established. What is your name?" : "Uplink stable. Proceeding..."), 
            searchUrls,
            updatedCartridge: {
                ambikaStage: parsed.nextStage ?? currentStage,
                userName: parsed.userName || cartridge.userName,
                projectUrl: parsed.projectUrl || cartridge.projectUrl,
                ambikaData: { ...(cartridge.ambikaData || {}), ...(parsed.dataUpdates || {}) }
            }
        };
    } catch (e) {
        console.error("Ambika Chat Error:", e);
        throw e;
    }
}

/**
 * FIX: Added generateLevelRecap as required by components/LevelRecap.tsx.
 * Generates a visual debrief image using Gemini 2.5 Flash Image.
 */
export async function generateLevelRecap(stats: LevelStats, playerB64: string | null, villainB64: string | null): Promise<{ data: string; mimeType: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [
        { text: `Generate a retro arcade-style mission debrief infographic for a level recap. 
                  Level: ${stats.levelNumber}
                  Status: ${stats.isWin ? 'VICTORY' : 'DEFEAT'}
                  Score: ${stats.score}
                  Time: ${stats.timeElapsed.toFixed(1)}s
                  Efficiency: ${Math.round((stats.uniqueTilesVisited / stats.stepsTaken) * 100)}%
                  Grade: ${stats.grade}
                  
                  The image should look like a data-rich CRT monitor from an 80s sci-fi movie. 
                  Incorporate the stats visually with neon colors and glitch effects.` }
    ];

    if (playerB64) {
        parts.push({
            inlineData: {
                data: playerB64,
                mimeType: "image/png"
            }
        });
        parts.push({ text: "This is the hero character." });
    }

    if (villainB64) {
        parts.push({
            inlineData: {
                data: villainB64,
                mimeType: "image/png"
            }
        });
        parts.push({ text: "This is the villain character." });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts }
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
            if (part.inlineData) {
                return {
                    data: part.inlineData.data,
                    mimeType: part.inlineData.mimeType
                };
            }
        }
    }

    throw new Error("No image data returned from model");
}

/**
 * FIX: Added getTrendingAIKeywords as required by components/ManifestoSection.tsx.
 * Fetches current trending AI keywords using Gemini 3 Flash.
 */
export async function getTrendingAIKeywords(): Promise<string[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "List 10 trending AI and tech keywords related to system architecture, neural networks, and agentic workflows. Return only a JSON array of strings.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const text = response.text;
        if (text) {
            return JSON.parse(text);
        }
    } catch (e) {
        console.error("Failed to fetch trending keywords:", e);
    }
    
    return ['AI Systems', 'TRIZ', 'Ambika', 'Neural Link', 'Agentic Workflows'];
}
