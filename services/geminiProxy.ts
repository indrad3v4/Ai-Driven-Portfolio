
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Use relative URL to leverage same-origin rewrite in firebase.json.
// This is the CRITICAL fix for 'Failed to fetch' in social browsers (LinkedIn/Telegram).
const PROXY_URL = '/proxy_gemini';
const REQUEST_TIMEOUT = 12000; 
const MAX_RETRIES = 3;

export interface ProxyRequest {
  model?: string;
  contents?: any[];
  config?: any;
  tools?: any[];
  toolConfig?: any;
  systemInstruction?: any;
  prompt?: string;
}

/**
 * Robust JSON parser that handles potential markdown decoration and whitespace.
 */
function parseGeminiResponse(text: string): any {
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(cleanText.substring(start, end + 1));
      } catch (innerError) {
        throw new Error('JSON_PARSE_FAILURE');
      }
    }
    throw new Error('NO_JSON_FOUND');
  }
}

/**
 * Fetch wrapper with timeout capability using AbortController.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { 
      ...options, 
      signal: controller.signal 
    });
    clearTimeout(id);
    return response;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      throw new Error(`TIMEOUT_${timeoutMs}ms`);
    }
    // "Failed to fetch" typically means the request was blocked by the browser.
    throw err; 
  }
}

/**
 * Calls the Gemini proxy with retries and same-origin optimization.
 */
export async function callGeminiViaProxy(request: ProxyRequest, modelOverride?: string): Promise<any> {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const targetModel = modelOverride || request.model || 'gemini-3-flash-preview';
      const payload: any = { ...request, model: targetModel };

      // Ensure body is stringified properly
      const body = JSON.stringify(payload);

      // On retry 2+, we attempt to send WITHOUT the application/json header
      // This creates a "Simple Request" which avoids CORS preflight OPTIONS entirely.
      const headers: Record<string, string> = attempt === 1 ? { 'Content-Type': 'application/json' } : {};

      const response = await fetchWithTimeout(PROXY_URL, {
        method: 'POST',
        headers,
        body,
        credentials: 'omit',
        mode: 'cors'
      }, REQUEST_TIMEOUT);

      if (!response.ok) {
        if (response.status === 429) throw new Error("RATE_LIMIT");
        if (response.status === 404) throw new Error("PROXY_NOT_FOUND_CHECK_FIREBASE_JSON");
        const text = await response.text();
        throw new Error(`SERVER_${response.status}_${text.substring(0, 50)}`);
      }

      const responseText = await response.text();
      return parseGeminiResponse(responseText);

    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || "";
      
      // If we see "Failed to fetch", it's likely a browser/CORS block.
      // We log it and let the retry loop attempt the "Simple Request" fallback.
      console.warn(`[PROXY] Attempt ${attempt} error: ${errorMsg}`);

      if (attempt < MAX_RETRIES) {
        // Backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  throw lastError;
}
