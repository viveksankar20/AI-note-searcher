// backend/utils/embedding.js
// Calls HF Sentence Similarity and returns an array of scores (one per candidate sentence)
const axios = require('axios');

const HF_MODEL = process.env.HF_SIM_MODEL || 'sentence-transformers/all-MiniLM-L6-v2';
const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Call Hugging Face Sentence Similarity:
 * payload:
 * {
 *   inputs: {
 *     source_sentence: "query text",
 *     sentences: ["candidate 1", "candidate 2", ...]
 *   }
 * }
 * @param {string} sourceSentence
 * @param {string[]} sentences
 * @returns {Promise<number[]>} similarity scores in the same order as sentences
 */
async function sentenceSimilarity(sourceSentence, sentences) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) throw new Error('HF_API_KEY not set in environment');

  // Basic retry to handle model cold starts (free tier)
  const maxAttempts = 5;
  let lastErr = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, status } = await axios.post(
        HF_URL,
        { inputs: { source_sentence: sourceSentence, sentences } },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // HF may reply with { "error": "...loading..." } on cold start
      if (data && data.error) {
        lastErr = new Error(`HuggingFace error: ${data.error}`);
        // If it looks like a loading message, wait and retry
        if (String(data.error).toLowerCase().includes('loading')) {
          await sleep(2000 * attempt);
          continue;
        }
        throw lastErr;
      }

      if (!Array.isArray(data)) {
        throw new Error(`Unexpected HF response: ${JSON.stringify(data).slice(0, 400)}`);
      }

      return data; // array of similarity scores
    } catch (err) {
      lastErr = err;
      // 503/524 etc. → retry with backoff
      const code = err?.response?.status;
      if (attempt < maxAttempts && (code === 503 || code === 524 || code === 408)) {
        await sleep(1500 * attempt);
        continue;
      }
      break;
    }
  }

  throw lastErr || new Error('HuggingFace sentence similarity failed');
}

module.exports = { sentenceSimilarity };
