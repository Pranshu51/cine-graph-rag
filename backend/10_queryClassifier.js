// =====================================================================
// 10_queryPlanner.js — NATURAL LANGUAGE → JSON COMPOSITION PLAN
// =====================================================================
//
// Gemini understands the question → picks which templates to combine.
// It does NOT write Cypher. It outputs a JSON plan.
//
// Example: "Actors in Oscar-winning movies"
// Plan: [traversal(Actor→Movie), traversal(Movie→Award), filter(Oscar), project(Actor.name)]
// =====================================================================

import { llm } from "./2_config.js";

const PLANNER_PROMPT = `You are a query planner for a movie knowledge graph.

GRAPH SCHEMA:
Nodes: Movie(title,year), Director(name), Actor(name), Genre(name), Theme(name), Award(name,category)
Relationships: Director-DIRECTED->Movie, Actor-ACTED_IN->Movie, Movie-BELONGS_TO->Genre, Movie-EXPLORES->Theme, Movie-WON->Award

OUTPUT a JSON plan using ONLY these step types:

1. "traversal": {"type":"traversal","from":"Label","rel":"RELATIONSHIP","to":"Label"}
2. "filter": {"type":"filter","field":"Label.property","op":"=","value":"some value"}
   Operators: =, <>, >, <, >=, <=, CONTAINS, STARTS WITH
3. "projection": {"type":"projection","fields":["Label.property"],"distinct":true/false}
4. "aggregation": {"type":"aggregation","function":"count","field":"Label.property","alias":"name","groupBy":"Label.property"}
5. "sort": {"type":"sort","field":"Label.property","direction":"ASC/DESC"}
6. "limit": {"type":"limit","value":number}

RULES:
- Award.name = type (e.g. "Oscar"), Award.category = category (e.g. "Best Picture")
- Always include a projection or aggregation step
- Output ONLY valid JSON. No markdown, no backticks.

EXAMPLES:

"Movies directed by James Cameron":
{"steps":[
  {"type":"traversal","from":"Director","rel":"DIRECTED","to":"Movie"},
  {"type":"filter","field":"Director.name","op":"=","value":"James Cameron"},
  {"type":"projection","fields":["Movie.title","Movie.year"],"distinct":true}
]}

"How many movies won an Oscar?":
{"steps":[
  {"type":"traversal","from":"Movie","rel":"WON","to":"Award"},
  {"type":"filter","field":"Award.name","op":"=","value":"Oscar"},
  {"type":"aggregation","function":"count","field":"Movie.title","alias":"oscar_movies"}
]}

"Actors in Oscar-winning sci-fi movies":
{"steps":[
  {"type":"traversal","from":"Actor","rel":"ACTED_IN","to":"Movie"},
  {"type":"traversal","from":"Movie","rel":"WON","to":"Award"},
  {"type":"traversal","from":"Movie","rel":"BELONGS_TO","to":"Genre"},
  {"type":"filter","field":"Award.name","op":"=","value":"Oscar"},
  {"type":"filter","field":"Genre.name","op":"=","value":"Sci-Fi"},
  {"type":"projection","fields":["Actor.name"],"distinct":true}
]}`;

const CLASSIFIER_PROMPT = `You are a query classifier for a movie knowledge graph.

Classify the query as either "graph" or "similarity".

"graph" = questions about facts, relationships, counts, lists
Examples:
- "Movies directed by Christopher Nolan"
- "Which actors won an Oscar?"
- "How many sci-fi movies are there?"
- "Who acted in Inception?"
- "Movies released after 2010"

"similarity" = recommendations, finding similar movies, vibe-based searches
Examples:
- "Movies like Inception"
- "Recommend me a thriller"
- "Movies similar to Interstellar"
- "Find movies with a similar vibe to The Matrix"
- "What should I watch if I liked Dune?"

Respond ONLY with this JSON. No markdown, no backticks:
{"type": "graph", "reasoning": "one line reason"}
OR
{"type": "similarity", "reasoning": "one line reason"}`;

// ── Classify: graph or similarity? ──
async function classifyQuery(query, resolvedEntities) {
  const entityContext = resolvedEntities?.entities?.length > 0
    ? `Resolved entities: ${resolvedEntities.entities.map(e => `${e.nodeName} (${e.label})`).join(", ")}`
    : "No entities resolved.";

  const response = await llm.invoke([
    { role: "system", content: CLASSIFIER_PROMPT },
    { role: "human", content: `Query: ${query}\n${entityContext}` },
  ]);

  let raw = response.content;
  if (Array.isArray(raw)) {
    raw = raw
      .filter((block) => typeof block === "string" || block.type === "text")
      .map((block) => (typeof block === "string" ? block : block.text))
      .join("\n");
  }
  raw = raw.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    // Default to graph if classification fails
    console.warn("⚠️ Classification failed, defaulting to graph");
    return { type: "graph", reasoning: "classification failed, defaulting to graph" };
  }
}

// ── Plan: build Cypher steps for graph queries ──
async function createQueryPlan(query) {
  const response = await llm.invoke([
    { role: "system", content: PLANNER_PROMPT },
    { role: "human", content: query },
  ]);

  let raw = response.content;
  if (Array.isArray(raw)) {
    raw = raw
      .filter((block) => typeof block === "string" || block.type === "text")
      .map((block) => (typeof block === "string" ? block : block.text))
      .join("\n");
  }
  raw = raw.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("❌ Failed to parse plan:", raw.substring(0, 300));
    throw new Error("Query planning failed. Please rephrase your question.");
  }
}

export { classifyQuery, createQueryPlan };




// import { llm } from "./2_config.js";

// const PLANNER_PROMPT = `You are a query planner for a movie knowledge graph.

// GRAPH SCHEMA:
// Nodes: Movie(title,year), Director(name), Actor(name), Genre(name), Theme(name), Award(name,category)
// Relationships: Director-DIRECTED->Movie, Actor-ACTED_IN->Movie, Movie-BELONGS_TO->Genre, Movie-EXPLORES->Theme, Movie-WON->Award

// OUTPUT a JSON plan using ONLY these step types:

// 1. "traversal": {"type":"traversal","from":"Label","rel":"RELATIONSHIP","to":"Label"}
// 2. "filter": {"type":"filter","field":"Label.property","op":"=","value":"some value"}
//    Operators: =, <>, >, <, >=, <=, CONTAINS, STARTS WITH
// 3. "projection": {"type":"projection","fields":["Label.property"],"distinct":true/false}
// 4. "aggregation": {"type":"aggregation","function":"count","field":"Label.property","alias":"name","groupBy":"Label.property"}
// 5. "sort": {"type":"sort","field":"Label.property","direction":"ASC/DESC"}
// 6. "limit": {"type":"limit","value":number}

// RULES:
// - Award.name = type (e.g. "Oscar"), Award.category = category (e.g. "Best Picture")
// - Always include a projection or aggregation step
// - Output ONLY valid JSON. No markdown, no backticks.

// EXAMPLES:

// "Movies directed by James Cameron":
// {"steps":[
//   {"type":"traversal","from":"Director","rel":"DIRECTED","to":"Movie"},
//   {"type":"filter","field":"Director.name","op":"=","value":"James Cameron"},
//   {"type":"projection","fields":["Movie.title","Movie.year"],"distinct":true}
// ]}

// "How many movies won an Oscar?":
// {"steps":[
//   {"type":"traversal","from":"Movie","rel":"WON","to":"Award"},
//   {"type":"filter","field":"Award.name","op":"=","value":"Oscar"},
//   {"type":"aggregation","function":"count","field":"Movie.title","alias":"oscar_movies"}
// ]}

// "Actors in Oscar-winning sci-fi movies":
// {"steps":[
//   {"type":"traversal","from":"Actor","rel":"ACTED_IN","to":"Movie"},
//   {"type":"traversal","from":"Movie","rel":"WON","to":"Award"},
//   {"type":"traversal","from":"Movie","rel":"BELONGS_TO","to":"Genre"},
//   {"type":"filter","field":"Award.name","op":"=","value":"Oscar"},
//   {"type":"filter","field":"Genre.name","op":"=","value":"Sci-Fi"},
//   {"type":"projection","fields":["Actor.name"],"distinct":true}
// ]}`;

// async function createQueryPlan(query) {
//   const response = await llm.invoke([
//     { role: "system", content: PLANNER_PROMPT },
//     { role: "human", content: query },
//   ]);

//   let raw = response.content;
//   // Gemini 2.5 thinking models return array: [{type:"thinking",...}, {type:"text", text:"..."}]
//   if (Array.isArray(raw)) {
//     raw = raw
//       .filter((block) => typeof block === "string" || block.type === "text")
//       .map((block) => (typeof block === "string" ? block : block.text))
//       .join("\n");
//   }
//   raw = raw.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

//   try {
//     return JSON.parse(raw);
//   } catch (err) {
//     console.error("❌ Failed to parse plan:", raw.substring(0, 300));
//     throw new Error("Query planning failed. Please rephrase your question.");
//   }
// }

// export { createQueryPlan };