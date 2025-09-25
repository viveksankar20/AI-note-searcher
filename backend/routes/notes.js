const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const { getEmbedding } = require('../utils/embedding');
const router = express.Router();

// Get all notes for the logged in user
router.get('/', auth, async (req, res) => {
  const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json(notes);
});

// Create new note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const note = new Note({ user: req.user.id, title, content, tags });
    // Try to embed (optional)
    try {
      if (process.env.HF_API_KEY) {
        const emb = await getEmbedding(`${title}\n${content}`.trim());
        note.embedding = emb;
      }
    } catch (e) {
      console.warn('Embedding failed (note still saved):', e.message);
    }
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;

    // Re-embed on content changes
    try {
      if (process.env.HF_API_KEY) {
        const emb = await getEmbedding(`${note.title}\n${note.content}`.trim());
        note.embedding = emb;
      }
    } catch (e) {
      console.warn('Embedding failed (note still saved):', e.message);
    }

    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
