/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const functions = require("firebase-functions");
require('dotenv').config(); 

// NATIVE FETCH IS AVAILABLE IN NODE 18+ (Gen 2 default)
// We remove dependencies to keep the function lean and avoid version conflicts.

exports.proxy_gemini = functions.region('us-central1').https.onRequest(async (req, res) => {
  // ==================================================================
  // 1. UNIVERSAL CORS HANDLING (MUST BE FIRST)
  // ==================================================================
  // We set these headers immediately to ensure the browser accepts the response,
  // even if the script crashes later or returns a 500 error.
  res.set('Access-Control-Allow-Origin', '*'); 
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.set('Access-Control-Max-Age', '3600');

  // Handle Preflight (Browser "Are you there?" check)
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // ==================================================================
  // 2. REQUEST VALIDATION & BODY PARSING
  // ==================================================================
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    console.log("VERSION: DIRECT_RUN_V5_ROBUST [START]");

    // TRIZ FIX: Social Browsers sometimes strip 'Content-Type: application/json'
    // forcing Firebase to treat body as string/buffer. We manually parse it here.
    let parsedBody = req.body;
    if (typeof parsedBody === 'string') {
        try {
            parsedBody = JSON.parse(parsedBody);
        } catch (e) {
            console.warn("Failed to parse string body, proceeding raw:", e);
        }
    }

    // ==================================================================
    // 3. API KEY EXTRACTION
    // ==================================================================
    // Prioritize configured secrets, then env vars
    const apiKey = 
      (functions.config().google && functions.config().google.api_key) ||
      (functions.config().gemini && functions.config().gemini.key) ||
      process.env.GEMINI_API_KEY || 
      process.env.API_KEY;
    
    if (!apiKey) {
      console.error("CRITICAL: API Key missing.");
      res.status(500).json({ error: "Server Configuration Error", details: "API Key missing" });
      return;
    }

    // ==================================================================
    // 4. PAYLOAD PREPARATION
    // ==================================================================
    const model = parsedBody.model || 'gemini-2.5-flash';
    let geminiBody = { ...parsedBody };
    delete geminiBody.model;

    // Compatibility Adapter: 'prompt' -> 'contents'
    // TRIZ UPDATE: Check for property existence (!== undefined) rather than truthiness.
    // This allows empty strings "" to be processed correctly.
    if (geminiBody.prompt !== undefined && !geminiBody.contents) {
       console.log("[Proxy] Adapting legacy prompt");
       const textPart = String(geminiBody.prompt || ""); 
       geminiBody.contents = [{ parts: [{ text: textPart }] }];
    }
    
    // CRITICAL: Always remove 'prompt' to prevent "Unknown name" error from Gemini
    if (geminiBody.prompt !== undefined) {
        delete geminiBody.prompt;
    }

    if (!geminiBody.contents) {
        console.error("Invalid Payload Structure:", JSON.stringify(geminiBody));
        res.status(400).json({ error: "Invalid Payload", details: "Missing 'contents'" });
        return;
    }

    // ==================================================================
    // 5. UPSTREAM REQUEST (NATIVE FETCH WITH TIMEOUT)
    // ==================================================================
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    // Create an abort controller for timeout (15s)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const upstreamResponse = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(geminiBody),
            signal: controller.signal
        });

        clearTimeout(timeout);
        const data = await upstreamResponse.json();

        if (!upstreamResponse.ok) {
          console.error("Gemini API Error:", JSON.stringify(data));
          // Forward the upstream error status code
          res.status(upstreamResponse.status).json(data);
          return;
        }

        // Success
        console.log("VERSION: DIRECT_RUN_V5_ROBUST [SUCCESS]");
        res.json(data);

    } catch (fetchError) {
        clearTimeout(timeout);
        if (fetchError.name === 'AbortError') {
             console.error("Upstream Timeout");
             res.status(504).json({ error: "Gateway Timeout", details: "Gemini API took too long to respond." });
        } else {
             throw fetchError;
        }
    }

  } catch (error) {
    console.error("Proxy Logic Crash:", error);
    // Because we set CORS headers at the top, this JSON will actually reach the frontend!
    res.status(500).json({ proxyError: "Internal Proxy Crash", details: error.message });
  }
});