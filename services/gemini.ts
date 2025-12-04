/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { InsightCartridge } from "../lib/insight-object";
import { LevelStats } from "../types";

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
      // Using Flash Image for stability and speed
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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
      // Using Flash Image for stability
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
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
      throw new Error("No image generated.");
    } catch (e) {
        console.error("Battle scene generation failed", e);
        throw e;
    }
}

export async function generateLevelRecap(
    stats: LevelStats,
    playerImageB64: string | null,
    villainImageB64: string | null
): Promise<{ data: string; mimeType: string }> {
    const ai = createAIClient();
    const prompt = `Generate a retro arcade 'MISSION DEBRIEF' screen illustration. 8-bit or 16-bit pixel art style. 
    The image should depict a tactical screen showing the result: ${stats.isWin ? "VICTORY" : "GAME OVER"}.
    Score: ${stats.score}. Grade: ${stats.grade}.
    If images are provided, incorporate stylized versions of the Hero and Villain.
    Dark background, neon text details.`;

    const parts: any[] = [];
    if (playerImageB64) {
        parts.push({ inlineData: { data: playerImageB64, mimeType: 'image/png' } });
    }
    if (villainImageB64) {
        parts.push({ inlineData: { data: villainImageB64, mimeType: 'image/png' } });
    }
    parts.push({ text: prompt });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: { responseModalities: [Modality.IMAGE] }
        });
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
            return {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
            };
        }
        throw new Error("No recap image generated");
    } catch (e) {
        console.error("Recap generation failed", e);
        throw e;
    }
}

export async function chatWithManagerAgent(
    message: string,
    cartridge: InsightCartridge
): Promise<{ text: string, updatedCartridge: Partial<InsightCartridge>, error?: string }> {
    const ai = createAIClient();
    
    // Construct context
    const context = `
    You are Ambika, a Strategic System Architect.
    Current Cartridge State:
    - Hero: ${cartridge.hero.name} (${cartridge.hero.description})
    - Villain: ${cartridge.villain.name} (${cartridge.villain.description})
    - Tension: ${cartridge.tension}
    - Quadrants: Strategy(${cartridge.quadrants.strategy.level}), Creative(${cartridge.quadrants.creative.level}), Producing(${cartridge.quadrants.producing.level}), Media(${cartridge.quadrants.media.level})
    
    User Input: "${message}"

    Your Goal: Guide the user to systematize their insight.
    If they haven't defined Hero/Villain, ask probing questions.
    If they have, help them advance the Quadrants.
    
    Output Format: JSON with 'response' (your narrative reply) and 'updates' (Partial<InsightCartridge> to update state).
    Example: { "response": "Great choice.", "updates": { "hero": { "name": "..." } } }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: context,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        const jsonText = response.text || "{}";
        const parsed = JSON.parse(jsonText);
        
        return {
            text: parsed.response || "System processed.",
            updatedCartridge: parsed.updates || {}
        };

    } catch (e: any) {
        console.error("Chat agent failed", e);
        return {
            text: "Connection interrupted. Please retry.",
            updatedCartridge: {},
            error: e.message
        };
    }
}

export async function systematizeInsight(
    cartridge: InsightCartridge
): Promise<Partial<InsightCartridge>> {
    const ai = createAIClient();
    const prompt = `
    Analyze this system state and provide percentage completion (0-100) for each quadrant based on completeness of definitions.
    Hero: ${cartridge.hero.description}
    Villain: ${cartridge.villain.description}
    History length: ${cartridge.chatHistory.length}

    Return JSON: { "quadrants": { "strategy": { "level": N }, "creative": { "level": N }, "producing": { "level": N }, "media": { "level": N } } }
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const parsed = JSON.parse(response.text || "{}");
        return parsed;
    } catch (e) {
        console.error("Systematization failed", e);
        return {};
    }
}

export async function generateNanoBananaImage(): Promise<{ data: string; mimeType: string }> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: "Generate a cool, cyberpunk pixel art banana floating in a digital void. Glowing neon yellow. 8-bit style.",
            config: { responseModalities: [Modality.IMAGE] }
        });
        
        const part = response.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
            return {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType || 'image/png'
            };
        }
        throw new Error("No image generated");
    } catch (e) {
        console.error("NanoBanana failed", e);
        throw e;
    }
}
