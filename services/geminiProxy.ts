
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const RELATIVE_PROXY = '/proxy_gemini';
// Updated to us-west1 and proxy_gemini endpoint as requested
const ABSOLUTE_PROXY = 'https://us-west1-indra-flywheel-db.cloudfunctions.net/proxy_gemini';

const REQUEST_TIMEOUT = 15000; 
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
    throw err; 
  }
}

const isSandboxEnv = () => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname;
    return !host.includes('indra-ai.dev') && !host.includes('indra-flywheel-db.web.app');
};

/**
 * Calls the Gemini proxy with adaptive gateway selection.
 */
export async function callGeminiViaProxy(request: ProxyRequest, modelOverride?: string): Promise<any> {
  let lastError: any;
  const inSandbox = isSandboxEnv();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const targetModel = modelOverride || request.model || 'gemini-3-flash-preview';
      const payload: any = { ...request, model: targetModel };
      const body = JSON.stringify(payload);

      let currentUrl: string;
      let headers: Record<string, string>;

      if (inSandbox) {
          currentUrl = ABSOLUTE_PROXY;
          headers = { 'Content-Type': 'text/plain' }; 
      } else {
          if (attempt === 1) {
              currentUrl = RELATIVE_PROXY;
              headers = { 'Content-Type': 'application/json' };
          } else {
              currentUrl = ABSOLUTE_PROXY;
              headers = { 'Content-Type': 'text/plain' };
          }
      }

      const response = await fetchWithTimeout(currentUrl, {
        method: 'POST',
        headers,
        body,
        credentials: 'omit',
        mode: 'cors'
      }, REQUEST_TIMEOUT);

      if (!response.ok) {
        if (response.status === 429) throw new Error("RATE_LIMIT_REACHED");
        const text = await response.text();
        throw new Error(`SERVER_ERROR_${response.status} - ${text}`);
      }

      const responseText = await response.text();
      return parseGeminiResponse(responseText);

    } catch (error: any) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  throw lastError;
}
