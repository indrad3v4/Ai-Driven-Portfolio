/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// URL verified from deployment logs: https://us-central1-indra-flywheel-db.cloudfunctions.net/proxy_gemini
const PROXY_URL = 'https://us-central1-indra-flywheel-db.cloudfunctions.net/proxy_gemini';

export interface ProxyRequest {
  contents?: {
    role: string;
    parts: { text: string }[];
  }[];
  systemInstruction?: {
    parts: { text: string }[];
  };
  generationConfig?: any;
  prompt?: string; // Fallback for simple prompt-only requests
}

/**
 * Smart converter: Transforms Gemini SDK format → Simple prompt
 * Handles both SDK format (contents + systemInstruction) and simple format (prompt string)
 */
function convertSDKToPrompt(request: ProxyRequest): string {
  // Case 1: Simple prompt format (already converted)
  if (request.prompt && !request.contents) {
    return request.prompt;
  }

  // Case 2: SDK format with contents + systemInstruction
  if (request.contents && Array.isArray(request.contents)) {
    let promptText = '';

    // Extract system instruction if present
    if (request.systemInstruction?.parts?.[0]?.text) {
      promptText += `[SYSTEM]\n${request.systemInstruction.parts[0].text}\n\n`;
    }

    // Extract all user messages from contents (conversation history)
    for (const content of request.contents) {
      if (content.role === 'user' || content.role === 'model') {
        const role = content.role === 'user' ? 'User' : 'Assistant';
        const text = content.parts?.[0]?.text || '';
        if (text) {
          promptText += `${role}: ${text}\n`;
        }
      }
    }

    return promptText.trim();
  }

  // Fallback: return empty or error
  console.warn('Could not extract prompt from request:', request);
  return 'Error: No prompt found in request';
}

export async function callGeminiViaProxy(request: ProxyRequest): Promise<string> {
  try {
    // ✅ STEP 1: Convert SDK format to simple prompt
    const prompt = convertSDKToPrompt(request);

    console.log('[Proxy] Converting request:', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 50) + '...'
    });

    // ✅ STEP 2: Send to proxy with SIMPLE format
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }), // Simple format proxy expects
      mode: 'cors',
      credentials: 'omit'
    });

    // Handle non-OK responses (4xx, 5xx)
    if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
            const errorJson = await response.json();
            errorDetails = JSON.stringify(errorJson);
            console.error(`[Proxy] Server Error (${response.status}):`, errorJson);
        } catch (e) {
            const text = await response.text();
            console.error(`[Proxy] Server Error (${response.status}):`, text);
            errorDetails = text.slice(0, 100);
        }
        throw new Error(`Proxy Error: ${response.status} - ${errorDetails}`);
    }

    // ✅ STEP 3: Parse response
    const data = await response.json();

    if (data.error) {
      throw new Error(`Gemini Error: ${JSON.stringify(data.error)}`);
    }

    // Extract text from Gemini response structure
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      if (data.promptFeedback) {
        throw new Error(`Safety filter activated: ${JSON.stringify(data.promptFeedback)}`);
      }
      throw new Error('No text in response (blocked or empty)');
    }

    return text;

  } catch (error: any) {
    // Improved error logging: ensure we see the object structure
    console.error('[Proxy] Call failed:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // User-friendly error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Network error: Cannot reach proxy. If in Telegram/Instagram, please open in Chrome/Safari.'
      );
    }
    
    if (error.message.includes('Proxy Error: 500')) {
        throw new Error('System Error: The AI Agent is offline (Check API Key).');
    }

    // Re-throw original error for debugging
    throw error;
  }
}