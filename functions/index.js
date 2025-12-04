/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const fetch = require("node-fetch");
require('dotenv').config(); 

// CRITICAL: Export name must match the URL path (proxy_gemini)
exports.proxy_gemini = functions.region('us-central1').https.onRequest((req, res) => {
  return cors(req, res, async () => {
    // 1. Allow only POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      // 2. Get API Key (Robust Check)
      // Checks: Process Env (Gen 2 preferred) -> Firebase Config (Gen 1 legacy) -> Hardcoded Fallback (Dev)
      const apiKey = 
        process.env.GEMINI_API_KEY || 
        process.env.API_KEY || 
        (functions.config().gemini && functions.config().gemini.key);
      
      // Debug Log (Masked)
      console.log("[Config] API Key status:", apiKey ? "PRESENT" : "MISSING");

      if (!apiKey) {
        console.error("CRITICAL: Gemini API Key is missing in server environment.");
        return res.status(500).json({ 
            error: "Backend Configuration Error", 
            details: "API Key not found. Please set GEMINI_API_KEY environment variable." 
        });
      }

      // ADAPTER: Handle simple { prompt } from frontend
      let geminiBody = req.body;
      if (req.body.prompt && !req.body.contents) {
         console.log("[Adapter] Wrapping simple prompt...");
         geminiBody = {
             contents: [{ parts: [{ text: req.body.prompt }] }]
         };
      }

      // 3. Forward request to Gemini
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(geminiBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Gemini Upstream Error:", JSON.stringify(data));
        // If 401 from Gemini, it means our key is invalid
        if (response.status === 400 || response.status === 401 || response.status === 403) {
             return res.status(500).json({ error: "Upstream Auth Error", details: "Gemini rejected the API key." });
        }
        return res.status(response.status).json(data);
      }

      // 4. Return successful response
      res.json(data);

    } catch (error) {
      console.error("Proxy Logic Error:", error);
      res.status(500).json({ error: "Internal Proxy Error", details: error.message });
    }
  });
});