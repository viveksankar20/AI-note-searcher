// backend/routes/search.js
const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const { sentenceSimilarity } = require('../utils/embedding'); // <-- changed import
const router = express.Router();

/**
 * GET /api/search?query=...&mode=keyword|semantic
 */
router.get('/', auth, async (req, res) => {
  const query = (req.query.query || '').trim();
  const mode = (req.query.mode || 'keyword').toLowerCase();
  if (!query) return res.status(400).json({ error: 'Missing query' });

  if (mode === 'keyword') {
    try {
      const results = await Note.find(
        { user: req.user.id, $text: { $search: query } },
        { score: { $meta: 'textScore' }, title: 1, content: 1, tags: 1, updatedAt: 1 }
      ).sort({ score: { $meta: 'textScore' } });
      return res.json({ mode, results });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Keyword search failed' });
    }
  }

  // --- NEW: sentence similarity (no stored embeddings needed) ---
  try {
    // Fetch user notes
    const notes = await Note.find(
      { user: req.user.id },
      { title: 1, content: 1, tags: 1, updatedAt: 1 }
    ).lean();

    if (notes.length === 0) return res.json({ mode: 'sentence-similarity', results: [] });

    // Build candidate sentences from notes
    const sentences = notes.map(n => {
      const t = (n.title || '').trim();
      const c = (n.content || '').trim();
      return (t + '\n' + c).trim() || t || c || '';
    });

    // Call HF sentence-similarity
    const scores = await sentenceSimilarity(query, sentences);

    // Merge & rank
    const ranked = notes
      .map((n, i) => ({
        _id: n._id,
        title: n.title,
        content: n.content,
        tags: n.tags || [],
        updatedAt: n.updatedAt,
        score: typeof scores[i] === 'number' ? scores[i] : 0
      }))
      .sort((a, b) => b.score - a.score);

    return res.json({ mode: 'sentence-similarity', results: ranked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Semantic (sentence-similarity) search failed' });
  }
});

module.exports = router;
