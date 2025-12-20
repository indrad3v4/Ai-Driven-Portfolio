
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
export async function chatWithManagerAgent(message: string, cartridge: InsightCartridge, language: string = 'EN'): Promise<{ text: string; updatedCartridge: Partial<InsightCartridge>; searchUrls?: string[] }> {
    const currentStage = cartridge.ambikaStage || 0;
    const isHandshake = message === "SYSTEM_INIT_HANDSHAKE";
    
    const frameworkContext = FRAMEWORKS.map(f => `${f.name}: ${f.description}`).join('; ');

    const systemInstructionText = `
    You are **AMBIKA**, a Human-Centric Strategy Orchestrator. 
    Tone: Senior Strategist, direct, respectful, empathetic.
    
    **LANGUAGE PROTOCOL:**
    - The user has selected the language: **${language}**.
    - You MUST respond EXCLUSIVELY in this language.
    - If language is PL, use professional and warm Polish.
    - If language is BEL, use professional Belarusian.
    - If language is EN, use professional English.
    - All JSON fields 'response' must be in the specified language.

    **YOUR 8-STAGE JOURNEY (Strict Sequence):**
    0. **HANDSHAKE**: Ask ONLY for their name. Establish the human link.
    1. **THE CABINET**: Greet them by name. Give them their "Cabinet Key" (ID: ${cartridge.id}) and explain the journey: Extracting insight from their digital thread, building the 7-point Creative Concept, and locking a production sprint.
    2. **THE PROBE**: Ask for ANY digital entry point (URL, LinkedIn, Blog, GH). Explain that anything holding their "Insight" works.
    3. **GOALS & TASKS**: Define what the system must actually DO based on their input.
    4. **STRATEGIC BACKGROUND**: Analyze the situation and competitors via search grounding.
    5. **THE BIG IDEA**: Formulate the core concept that drives all communication.
    6. **ACTIVATION & PRODUCTION**: Define the mechanics and "Rate-cards/Timings".
    7. **MEDIA & FUNNEL**: Plan the promotion and user conversion path.
    8. **THE LOCK**: Final conclusion, cost estimation, and next steps.
    
    **GROUNDING PROTOCOL:**
    - Use 'googleSearch' tool when a URL is provided.
    - Map findings to these frameworks: [${frameworkContext}].
    - ALWAYS return valid JSON following the schema.
    `;

    try {
        const history = buildHistoryContents(cartridge, message);

        const responseData = await callGeminiViaProxy({
            model: "gemini-3-flash-preview",
            contents: history,
            config: {
                systemInstruction: { parts: [{ text: systemInstructionText }] },
                responseMimeType: "application/json",
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
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
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
            text: `⚠️ Neural Link Error: ${(e as Error).message}`,
            updatedCartridge: {}
        };
    }
}

export async function generateLevelRecap(stats: LevelStats, playerB64: string | null, villainB64: string | null): Promise<{ data: string; mimeType: string }> {
    return { data: "", mimeType: "" }; 
}

export async function getTrendingAIKeywords(): Promise<string[]> {
    try {
        const responseData = await callGeminiViaProxy({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: "Return a list of 6 absolute most trending AI terms, tools or technologies right now. Return ONLY the names, separated by commas. Focus on agentic AI, LLM benchmarks, and industrial systems." }] }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const keywords = text.split(',').map((s: string) => s.trim().toUpperCase()).filter((s: string) => s.length > 0);
        return keywords.length > 0 ? keywords : ['AGENTIC WORKFLOWS', 'DEEPSEEK-V3', 'REASONING MODELS', 'TRIZ ARCHITECTURE', 'NEURAL LINK', 'INDUSTRIAL MLOPS'];
    } catch (e) {
        return ['AGENTIC WORKFLOWS', 'DEEPSEEK-V3', 'REASONING MODELS', 'TRIZ ARCHITECTURE', 'NEURAL LINK', 'INDUSTRIAL MLOPS'];
    }
}
