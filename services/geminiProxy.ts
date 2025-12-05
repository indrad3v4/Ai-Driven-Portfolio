/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ✅ TRIZ SOLUTION: Use Absolute URL to bypass Hosting Rewrite issues
// Verified working via curl: https://us-central1-indra-flywheel-db.cloudfunctions.net/proxy_gemini
const PROXY_URL = 'https://us-central1-indra-flywheel-db.cloudfunctions.net/proxy_gemini';

export interface ProxyRequest {
  model?: string;
  contents?: any[];
  config?: any;
  tools?: any[];
  toolConfig?: any;
  systemInstruction?: any;
  prompt?: string;
}

export async function callGeminiViaProxy(request: ProxyRequest, modelOverride?: string): Promise<any> {
  try {
    const targetModel = modelOverride || request.model || 'gemini-2.5-flash';

    // Construct payload
    const payload: any = {
      ...request,
      model: targetModel
    };

    // Client-side Adapter (Defense in Depth)
    // Ensure we convert 'prompt' to 'contents' locally to avoid ambiguity
    if (payload.prompt !== undefined && !payload.contents) {
        payload.contents = [{ parts: [{ text: payload.prompt || "" }] }];
        delete payload.prompt;
    }

    // Call endpoint with robust options for WebViews
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'omit', // CRITICAL: Prevents cookie blocking in Social Browsers (IG/Telegram)
      mode: 'cors'
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[ProxyClient] Error (${response.status}):`, text);
      throw new Error(`Proxy Error: ${response.status} - ${text.slice(0, 100)}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Gemini Error: ${JSON.stringify(data.error)}`);
    }

    return data;

  } catch (error: any) {
    console.error('[ProxyClient] Call failed:', error.message);
    // Identify network blocks specifically for the UI to handle
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
       throw new Error('NETWORK_BLOCK');
    }
    throw error;
  }
}