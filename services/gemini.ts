
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";

// Ensure API key is present
if (!process.env.API_KEY) {
  console.error("Missing API_KEY environment variable.");
}

const createAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fetches trending AI keywords using Gemini 2.5 Flash and Google Search Grounding.
 * Used for dynamic hero text.
 */
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

/**
 * Gets location context using Google Maps Grounding.
 * Used to ground the system in the user's real-world context.
 */
export async function getLocationContext(lat: number, lng: number): Promise<string> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "What city and country am I in? And what is one cool tech or cyberpunk fact about this region?",
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    googleMaps: {
                        capabilities: ['PLACES_NEARBY', 'PLACES_DETAILS'] // Default set
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

/**
 * Generates a game strategy tip using Gemini 3.0 Pro with Thinking Mode.
 */
export async function getGameStrategyTip(currentLevel: number, difficulty: string): Promise<string> {
    const ai = createAIClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `The user is playing a Pacman-style retro arcade game. Level: ${currentLevel}, Difficulty: ${difficulty}. Provide a single, short, cryptic but helpful pro-tip for survival. Under 20 words.`,
            config: {
                thinkingConfig: { thinkingBudget: 1024 }, // Enable Thinking Mode
            }
        });
        return response.text || "STAY MOVING.";
    } catch (e) {
        console.warn("Failed to generate strategy tip", e);
        return "TRUST YOUR INSTINCTS.";
    }
}

/**
 * Edits an existing sprite using Gemini 2.5 Flash Image (Nano Banana).
 * Allows users to refine their generated sprites with text prompts.
 */
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

/**
 * Generates a retro arcade sprite from a source image.
 * Uses Gemini 3 Pro for high fidelity generation.
 */
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
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            },
            {
              text: promptStr,
            },
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

/**
 * Generates a comic-style battle scene featuring both sprites.
 */
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

/**
 * Generates a level recap infographic.
 */
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
