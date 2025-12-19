
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const functions = require("firebase-functions");
require('dotenv').config(); 

/**
 * Proxy function optimized for mobile/social browsers.
 * Handles cases where 'Content-Type' headers might be missing or stripped.
 */
exports.proxy_gemini = functions
  .runWith({ 
    timeoutSeconds: 30,     // Total function timeout
    memory: '512MB',        // Increased memory to reduce cold start duration
    maxInstances: 50        // Scale quickly to handle spikes
  })
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    // 1. CORS Headers
    res.set('Access-Control-Allow-Origin', '*'); 
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      // TRIZ FIX: Social Browsers (IG/Telegram/LinkedIn) often strip 'Content-Type: application/json'
      // We manually parse the body if it arrives as a string.
      let parsedBody = req.body;
      if (typeof parsedBody === 'string') {
          try {
              parsedBody = JSON.parse(parsedBody);
          } catch (e) {
              console.warn("[Proxy] Body manual parse failed", e);
          }
      }

      if (!parsedBody || !parsedBody.contents) {
          res.status(400).json({ success: false, error: "Invalid Payload", details: "Missing contents" });
          return;
      }

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        res.status(500).json({ success: false, error: "Server Configuration Error", details: "API Key missing" });
        return;
      }

      const model = parsedBody.model || 'gemini-3-flash-preview';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      // Preparation
      const geminiBody = { ...parsedBody };
      delete geminiBody.model;

      // Internal timeout to ensure we don't hit the Cloud Function limit blindly
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s for Gemini call

      const upstreamResponse = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
          signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await upstreamResponse.json();

      if (!upstreamResponse.ok) {
        res.status(upstreamResponse.status).json(data);
        return;
      }

      res.status(200).json(data);

    } catch (error) {
      console.error("Proxy Logic Crash:", error.message);
      
      const statusCode = error.name === 'AbortError' ? 504 : 500;
      const errorMessage = error.name === 'AbortError' ? "Upstream Timeout" : error.message;

      res.status(statusCode).json({ 
        success: false, 
        error: "Internal Proxy Error", 
        details: errorMessage 
      });
    }
  });
