/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { callGeminiViaProxy } from "./geminiProxy";
import { InsightCartridge } from "../lib/insight-object";
import { LevelStats } from "../types";

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
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
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
    const context = `You are Ambika, a Strategic System Architect. Hero: ${cartridge.hero.name}. Villain: ${cartridge.villain.name}. Tension: ${cartridge.tension}. User: "${message}". Output JSON: { "response": "...", "updates": {...} }`;
    try {
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: context }] }],
            model: "gemini-2.5-flash"
        });
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const parsed = JSON.parse(jsonText);
        return { text: parsed.response || "System processed", updatedCartridge: parsed.updates || {} };
    } catch (e: any) {
        console.error("Chat agent failed", e);
        return { text: "Connection interrupted. Please retry.", updatedCartridge: {}, error: e.message };
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
        const data = await callGeminiViaProxy({
            contents: [{ parts: [{ text: "Cyberpunk pixel art banana floating in digital void. Glowing neon yellow. 8-bit style." }] }],
            model: "gemini-2.5-flash-image"
        });
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
        throw new Error("No image");
    } catch (e) {
        console.error("NanoBanana failed", e);
        throw e;
    }
}
