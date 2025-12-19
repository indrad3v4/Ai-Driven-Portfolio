
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const functions = require("firebase-functions");
require('dotenv').config(); 

// --- DEPLOYMENT_VERSION: 1.0.6 ---
// Syncing with us-west1 region and proxy_gemini naming convention

const proxyHandler = functions
  .runWith({ 
    timeoutSeconds: 30,
    memory: '512MB',
    maxInstances: 50
  })
  .region('us-west1')
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
      let parsedBody = req.body;
      
      // Robust Parsing: Handle cases where Firebase doesn't auto-parse JSON
      if (typeof parsedBody === 'string' && parsedBody.trim().startsWith('{')) {
          try {
              parsedBody = JSON.parse(parsedBody);
          } catch (e) {
              console.error("[Proxy] JSON Parse Error:", e.message);
          }
      }

      // Check if it's a valid object and looks like a Gemini request
      const isObject = parsedBody && typeof parsedBody === 'object';
      const isGeminiRequest = isObject && (parsedBody.contents || parsedBody.prompt);
      
      if (!isGeminiRequest) {
          res.status(200).json({ 
            success: true, 
            status: "ONLINE", 
            gateway: "INDRA_UPLINK_v1.0.6",
            message: "Proxy is stable in us-west1. Awaiting Gemini-structured payload.",
            timestamp: new Date().toISOString()
          });
          return;
      }

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: "Server Configuration Error", details: "API Key missing in environment" });
        return;
      }

      const model = parsedBody.model || 'gemini-3-flash-preview';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      // Prepare the upstream payload
      const geminiBody = { ...parsedBody };
      delete geminiBody.model;

      const upstreamResponse = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody)
      });

      const data = await upstreamResponse.json();
      res.status(upstreamResponse.status).json(data);

    } catch (error) {
      console.error("Proxy Logic Crash:", error.message);
      res.status(500).json({ 
        success: false, 
        error: "Internal Proxy Error", 
        details: error.message 
      });
    }
  });

// Renamed from callGemini to proxy_gemini to match rewrite rules and user requirement
exports.proxy_gemini = proxyHandler;
