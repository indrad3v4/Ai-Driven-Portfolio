/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { InsightCartridge } from "../lib/insight-object";
import { FRAMEWORKS } from "../lib/framework-database";
import { LevelStats } from "../types";

// --- CONFIGURATION ---
const API_URL = "https://us-west1-indra-flywheel-db.cloudfunctions.net/proxy_gemini";

// --- HELPER: Proxy Caller ---
async function callGeminiViaProxy(payload: { model: string; contents: any[]; config?: any }) {
    console.log("[PROXY] Sending payload:", JSON.stringify(payload, null, 2));

    // FIX: Structure the body correctly for the Cloud Function / Gemini API
    // 'systemInstruction' and 'tools' must be at the ROOT level, NOT inside generationConfig.
    const body = {
        contents: payload.contents,
        generationConfig: {
            responseMimeType: payload.config?.responseMimeType,
            responseSchema: payload.config?.responseSchema
        },
        systemInstruction: payload.config?.systemInstruction,
        tools: payload.config?.tools
    };

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Proxy Error ${response.status}: ${errText}`);
    }

    return await response.json();
}

// --- HELPER: History Builder ---
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

// --- MAIN FUNCTION: Chat with Manager ---
export async function chatWithManagerAgent(message: string, cartridge: InsightCartridge): Promise<{ text: string; updatedCartridge: Partial<InsightCartridge>; searchUrls?: string[] }> {
    const currentStage = cartridge.ambikaStage || 0;
    const isHandshake = message === "SYSTEM_INIT_HANDSHAKE";
    
    const frameworkContext = FRAMEWORKS.map(f => `${f.name}: ${f.description}`).join('; ');

    const systemInstructionText = `
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
        // const tools = needsSearch ? [{ googleSearch: {} }] : [];

        const responseData = await callGeminiViaProxy({
            model: "gemini-3-flash-preview",
            contents: history,
            config: {
                systemInstruction: { parts: [{ text: systemInstructionText }] },
                responseMimeType: "application/json",
                // tools,
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
        let text = candidate?.content?.parts?.[0]?.text || "{}";
        
        // Clean up markdown code blocks
        text = text.replace(/``````/g, '').trim();
        
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            console.warn("JSON Parse failed, using raw text fallback", text);
            parsed = { response: text, nextStage: currentStage };
        }
        
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
        return {
            text: `⚠️ Neural Link Error: ${(e as Error).message}. (Check console for details)`,
            updatedCartridge: {}
        };
    }
}

// ... Keep other functions (generateLevelRecap, getTrendingAIKeywords) as they were in previous version ...
export async function generateLevelRecap(stats: LevelStats, playerB64: string | null, villainB64: string | null): Promise<{ data: string; mimeType: string }> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.API_KEY || "YOUR_API_KEY_HERE";
    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ text: `Generate a retro arcade-style mission debrief infographic...` }];
    return { data: "", mimeType: "" }; 
}

export async function getTrendingAIKeywords(): Promise<string[]> {
    return ['AI Systems', 'TRIZ', 'Ambika', 'Neural Link', 'Agentic Workflows'];
}
