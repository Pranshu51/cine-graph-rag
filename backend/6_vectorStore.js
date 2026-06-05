import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { embedText, pineconeIndex } from "./2_config.js";

const EMBED_CONCURRENCY = 5;
const EMBED_DELAY_MS = 500;
const UPSERT_BATCH_SIZE = 100;
const VECTORS_CACHE_PATH = "./data/vectors_cache.json";

async function parsePDF(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdf(buffer);
  console.log(`   📄 Parsed PDF: ${data.numpages} pages, ~${data.text.length} characters`);
  return data.text;
}

function chunkText(rawText) {
  const blocks = rawText.split(/\n-{5,}\n/);
  const chunks = [];
  for (const block of blocks) {
    const text = block.trim();
    if (!text || text.length < 20) continue;
    chunks.push(text);
  }
  return chunks;
}

async function embedWithRetry(text, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await embedText(text);
    } catch (err) {
      const is429 = err.message?.includes("429");
      const wait = is429 ? attempt * 20 : attempt * 5;
      if (attempt < maxRetries) {
        console.warn(`   ⚠️ Embed failed (attempt ${attempt}). Waiting ${wait}s...`);
        await new Promise((r) => setTimeout(r, wait * 1000));
      } else {
        console.error(`   ❌ Embed permanently failed:`, err.message?.substring(0, 100));
        return null;
      }
    }
  }
}

async function buildVectorStore(pdfPath) {
  console.log(`\n📐 Building vector store from PDF...`);
  console.log(`   ⚡ Concurrency: ${EMBED_CONCURRENCY} parallel embeddings\n`);

  const startTime = Date.now();
  let vectors = [];

  // ── CHECK CACHE FIRST ──
  if (fs.existsSync(VECTORS_CACHE_PATH)) {
    console.log(`   💾 Found cached vectors, skipping embedding...`);
    const raw = fs.readFileSync(VECTORS_CACHE_PATH, "utf-8");
    vectors = JSON.parse(raw);
    console.log(`   ✅ Loaded ${vectors.length} cached vectors`);
  } else {
    // ── EMBED FROM SCRATCH ──

    console.log("   📄 Step 1: Parsing PDF...");
    const rawText = await parsePDF(pdfPath);

    console.log("   ✂️  Step 2: Chunking text...");
    const chunks = chunkText(rawText);
    console.log(`   ✅ Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      console.error("   ❌ No chunks created! Check PDF format.");
      return;
    }

    console.log(`\n   🧠 Step 3: Embedding ${chunks.length} chunks...`);
    let failCount = 0;

    for (let i = 0; i < chunks.length; i += EMBED_CONCURRENCY) {
      const batch = chunks.slice(i, i + EMBED_CONCURRENCY);
      const roundNum = Math.floor(i / EMBED_CONCURRENCY) + 1;
      const totalRounds = Math.ceil(chunks.length / EMBED_CONCURRENCY);

      if ((roundNum - 1) % 10 === 0 || roundNum === totalRounds) {
        console.log(`   🔄 Round ${roundNum}/${totalRounds} (chunks ${i + 1}-${Math.min(i + EMBED_CONCURRENCY, chunks.length)})...`);
      }

      const results = await Promise.all(
        batch.map(async (text, j) => {
          const embedding = await embedWithRetry(text);
          if (!embedding) return null;
          return {
            id: `chunk-${i + j}`,
            values: embedding,
            metadata: { text },
          };
        })
      );

      for (const r of results) {
        if (r) vectors.push(r);
        else failCount++;
      }

      if (i + EMBED_CONCURRENCY < chunks.length) {
        await new Promise((r) => setTimeout(r, EMBED_DELAY_MS));
      }
    }

    const embedTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n   ✅ Embedded ${vectors.length}/${chunks.length} in ${embedTime}s (${failCount} failed)`);

    fs.writeFileSync(VECTORS_CACHE_PATH, JSON.stringify(vectors));
    console.log(`   💾 Vectors saved to ${VECTORS_CACHE_PATH}`);
  }

  if (vectors.length === 0) {
    console.error("   ❌ No vectors to upsert!");
    return;
  }

  // ── Step 4: Upsert to Pinecone ──
  console.log(`\n   📦 Step 4: Upserting to Pinecone...`);

  for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
    const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);
    const batchNum = Math.floor(i / UPSERT_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(vectors.length / UPSERT_BATCH_SIZE);

    const records = batch
      .filter(v => v && Array.isArray(v.values) && v.values.length > 0)
      .map(v => ({
        id:       String(v.id),
        values:   v.values,
        metadata: v.metadata || {},
      }));

    if (records.length === 0) {
      console.warn(`   ⚠️ Batch ${batchNum} empty after filter, skipping...`);
      continue;
    }

    console.log(`   📦 Batch ${batchNum}/${totalBatches} (${records.length} vectors)...`);
    await pineconeIndex.upsert({ records });
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const stats = await pineconeIndex.describeIndexStats();
  console.log(`\n✅ Vector store built in ${totalTime}s! Total vectors: ${stats.totalRecordCount}`);
}

export { buildVectorStore };






// import fs from "fs";
// import pdf from "pdf-parse/lib/pdf-parse.js";
// // import { embedText, pineconeIndex } from "./2_config.js";
// import { embedText, pineconeIndex, pinecone } from "./2_config.js";


// const EMBED_CONCURRENCY = 5;
// const EMBED_DELAY_MS = 500;
// const UPSERT_BATCH_SIZE = 100;
// const VECTORS_CACHE_PATH = "./data/vectors_cache.json"; // ← save here

// async function parsePDF(pdfPath) {
//   const buffer = fs.readFileSync(pdfPath);
//   const data = await pdf(buffer);
//   console.log(`   📄 Parsed PDF: ${data.numpages} pages, ~${data.text.length} characters`);
//   return data.text;
// }

// function chunkText(rawText) {
//   const blocks = rawText.split(/\n-{5,}\n/);
//   const chunks = [];
//   for (const block of blocks) {
//     const text = block.trim();
//     if (!text || text.length < 20) continue;
//     chunks.push(text);
//   }
//   return chunks;
// }

// async function embedWithRetry(text, maxRetries = 3) {
//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       return await embedText(text);
//     } catch (err) {
//       const is429 = err.message?.includes("429");
//       const wait = is429 ? attempt * 20 : attempt * 5;
//       if (attempt < maxRetries) {
//         console.warn(`   ⚠️ Embed failed (attempt ${attempt}). Waiting ${wait}s...`);
//         await new Promise((r) => setTimeout(r, wait * 1000));
//       } else {
//         console.error(`   ❌ Embed permanently failed:`, err.message?.substring(0, 100));
//         return null;
//       }
//     }
//   }
// }

// async function buildVectorStore(pdfPath) {
//   console.log(`\n📐 Building vector store from PDF...`);
//   console.log(`   ⚡ Concurrency: ${EMBED_CONCURRENCY} parallel embeddings\n`);

//   const startTime = Date.now();
//   let vectors = [];

//   // ── CHECK CACHE FIRST ──
//   // If vectors_cache.json exists, skip embedding entirely
//   if (fs.existsSync(VECTORS_CACHE_PATH)) {
//     console.log(`   💾 Found cached vectors at ${VECTORS_CACHE_PATH}, skipping embedding...`);
//     const raw = fs.readFileSync(VECTORS_CACHE_PATH, "utf-8");
//     vectors = JSON.parse(raw);
//     console.log(`   ✅ Loaded ${vectors.length} cached vectors`);
//   } else {
//     // ── EMBED FROM SCRATCH ──

//     // Step 1: Parse PDF
//     console.log("   📄 Step 1: Parsing PDF...");
//     const rawText = await parsePDF(pdfPath);

//     // Step 2: Chunk
//     console.log("   ✂️  Step 2: Chunking text...");
//     const chunks = chunkText(rawText);
//     console.log(`   ✅ Created ${chunks.length} chunks`);

//     if (chunks.length === 0) {
//       console.error("   ❌ No chunks created! Check PDF format.");
//       return;
//     }

//     // Step 3: Embed
//     console.log(`\n   🧠 Step 3: Embedding ${chunks.length} chunks...`);
//     let failCount = 0;

//     for (let i = 0; i < chunks.length; i += EMBED_CONCURRENCY) {
//       const batch = chunks.slice(i, i + EMBED_CONCURRENCY);
//       const roundNum = Math.floor(i / EMBED_CONCURRENCY) + 1;
//       const totalRounds = Math.ceil(chunks.length / EMBED_CONCURRENCY);

//       if ((roundNum - 1) % 10 === 0 || roundNum === totalRounds) {
//         console.log(`   🔄 Round ${roundNum}/${totalRounds} (chunks ${i + 1}-${Math.min(i + EMBED_CONCURRENCY, chunks.length)})...`);
//       }

//       const results = await Promise.all(
//         batch.map(async (text, j) => {
//           const embedding = await embedWithRetry(text);
//           if (!embedding) return null;
//           return {
//             id: `chunk-${i + j}`,
//             values: embedding,
//             metadata: { text },
//           };
//         })
//       );

//       for (const r of results) {
//         if (r) vectors.push(r);
//         else failCount++;
//       }

//       if (i + EMBED_CONCURRENCY < chunks.length) {
//         await new Promise((r) => setTimeout(r, EMBED_DELAY_MS));
//       }
//     }

//     const embedTime = ((Date.now() - startTime) / 1000).toFixed(1);
//     console.log(`\n   ✅ Embedded ${vectors.length}/${chunks.length} in ${embedTime}s (${failCount} failed)`);

//     // ── SAVE TO CACHE ── so next run skips embedding
//     fs.writeFileSync(VECTORS_CACHE_PATH, JSON.stringify(vectors));
//     console.log(`   💾 Vectors saved to ${VECTORS_CACHE_PATH}`);
//   }

// if (vectors.length === 0) {
//     console.error("   ❌ No vectors to upsert!");
//     return;
//   }

//   // ── DEBUG: add here ──
//   console.log("   🔍 vectors[0]:", JSON.stringify(vectors[0]).substring(0, 300));
//   console.log("   🔍 typeof values:", typeof vectors[0]?.values);
//   console.log("   🔍 isArray:", Array.isArray(vectors[0]?.values));

//   // Step 4: Upsert to Pinecone
//   console.log(`\n   📦 Step 4: Upserting to Pinecone...`);

//   for (let i = 0; i < vectors.length; i += UPSERT_BATCH_SIZE) {
//     const batch = vectors.slice(i, i + UPSERT_BATCH_SIZE);
//     const batchNum = Math.floor(i / UPSERT_BATCH_SIZE) + 1;
//     const totalBatches = Math.ceil(vectors.length / UPSERT_BATCH_SIZE);

//     // Ensure correct Pinecone v5 format
//     const records = batch
//       .filter(v => v && Array.isArray(v.values) && v.values.length > 0)
//       .map(v => ({
//         id:       String(v.id),
//         values:   v.values,
//         metadata: v.metadata || {},
//       }));

//     if (records.length === 0) {
//       console.warn(`   ⚠️ Batch ${batchNum} empty after filter, skipping...`);
//       continue;
//     }

//     console.log(`   📦 Batch ${batchNum}/${totalBatches} (${records.length} vectors)...`);
//     console.log("   🔍 records.length:", records.length);
// console.log("   🔍 records[0].id:", records[0]?.id);
// console.log("   🔍 records[0].values.length:", records[0]?.values?.length);
// console.log("   🔍 pineconeIndex:", pineconeIndex?.target || pineconeIndex?.indexName || JSON.stringify(Object.keys(pineconeIndex)));
//     // await pineconeIndex.upsert(records);
// await pineconeIndex.upsert({ records });

//   }

//   const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
//   const stats = await pineconeIndex.describeIndexStats();
//   console.log(`\n✅ Vector store built in ${totalTime}s! Total vectors: ${stats.totalRecordCount}`);
// }

// export { buildVectorStore };