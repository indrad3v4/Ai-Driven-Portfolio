
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const functions = require("firebase-functions");
require('dotenv').config(); 

// --- DEPLOYMENT_VERSION: 1.0.4 ---
// (Change this number to force Firebase to redeploy)

const proxyHandler = functions
  .runWith({ 
    timeoutSeconds: 30,
    memory: '512MB',
    maxInstances: 50
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
      let parsedBody = req.body;
      if (typeof parsedBody === 'string') {
          try {
              parsedBody = JSON.parse(parsedBody);
          } catch (e) {
              console.warn("[Proxy] Body manual parse failed", e);
          }
      }

      // IMPROVED HEALTH CHECK:
      // If it's a "ping" or just doesn't look like a standard Gemini request, 
      // return a status report instead of a 400 error from Google.
      const isGeminiRequest = parsedBody && (parsedBody.contents || parsedBody.prompt);
      
      if (!isGeminiRequest) {
          res.status(200).json({ 
            success: true, 
            status: "ONLINE", 
            gateway: "INDRA_UPLINK_v1.0.4",
            message: "Uplink stable. Send 'contents' array for processing.",
            timestamp: new Date().toISOString(),
            echo: parsedBody // Echo back what we received for debugging
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

// Primary Export used by Firebase
exports.callGemini = proxyHandler;
