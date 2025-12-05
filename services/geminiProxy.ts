/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const PROXY_URL = 'https://us-central1-indra-flywheel-db.cloudfunctions.net/callGemini';

export interface ProxyRequest {
  model?: string;
  contents?: any[];
  config?: any;
  tools?: any[];
  toolConfig?: any;
  systemInstruction?: any;
  prompt?: string;
}

// Simple JSON parser - try direct, then extract from braces
function parseGeminiResponse(text: string): any {
  // 🔥 TRIZ FIX: Remove Markdown code fences
  let cleanText = text.replace(/\`\`\`json/g, ''); // Escaped backticks
  cleanText = cleanText.replace(/\`\`\`/g, '');    // Escaped backticks
  cleanText = cleanText.trim();
  
  try {
    return JSON.parse(cleanText);
  } catch {
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found');
    const jsonStr = cleanText.substring(start, end + 1);
    return JSON.parse(jsonStr);
  }
}



export async function callGeminiViaProxy(request: ProxyRequest, modelOverride?: string): Promise<any> {
  try {
    const targetModel = modelOverride || request.model || 'gemini-2.5-flash';
    const payload: any = { ...request, model: targetModel };

    // Convert prompt to contents format
    if (payload.prompt !== undefined && !payload.contents) {
        payload.contents = [{ parts: [{ text: payload.prompt || "" }] }];
        delete payload.prompt;
    }

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'omit',
      mode: 'cors'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Proxy Error: ${response.status}`);
    }

    const responseText = await response.text();
    const data = parseGeminiResponse(responseText);

    if (data.error) {
      throw new Error(`Gemini Error: ${JSON.stringify(data.error)}`);
    }

    return data;

  } catch (error: any) {
    console.error('[PROXY] Call failed:', error.message);
    throw error;
  }
}
