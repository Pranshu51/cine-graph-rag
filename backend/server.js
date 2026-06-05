// =====================================================================
// server.js — Express API server for the GraphRAG frontend
// =====================================================================
// Command: node server.js
//
// Exposes:
//   POST /api/query  { query: "..." }  → { answer: "..." }
//   GET  /api/health                   → { status: "ok" }
// =====================================================================

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { resolveQueryEntities } from "./9_entityResolver.js";
import { classifyQuery } from "./10_queryClassifier.js";
import { handleGraphQuery } from "./11_graphHandler.js";
import { handleSimilarityQuery } from "./12_similarityHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend from /public folder
app.use(express.static(path.join(__dirname, "public")));

// ── Health check ──
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── Main query endpoint ──
app.post("/api/query", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "Query is required." });
  }

  const steps = [];

  try {
    // Step 1: Entity Resolution
    steps.push({ step: "entity_resolution", status: "running" });
    const resolved = await resolveQueryEntities(query.trim());
    steps[0].status = "done";
    steps[0].data = resolved.entities;

    // Step 2: Classification
    steps.push({ step: "classification", status: "running" });
    const classification = await classifyQuery(query.trim(), resolved);
    steps[1].status = "done";
    steps[1].data = classification;

    // Step 3: Route to handler
    steps.push({ step: "query_execution", status: "running" });
    let answer;

    if (classification.type === "similarity") {
      answer = await handleSimilarityQuery(query.trim(), resolved);
    } else {
      answer = await handleGraphQuery(query.trim(), resolved);
    }

    steps[2].status = "done";

    return res.json({
      query: query.trim(),
      answer,
      queryType: classification.type,
      reasoning: classification.reasoning,
      entities: resolved.entities,
      steps,
    });
  } catch (err) {
    console.error("❌ Query error:", err.message);
    return res.status(500).json({
      error: err.message || "Query failed. Please try again.",
      steps,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎬 GraphRAG Server running at http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API:      http://localhost:${PORT}/api/query\n`);
});