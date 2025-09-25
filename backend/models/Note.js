const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  tags: [{ type: String }],
  embedding: { type: [Number], default: [] }
}, { timestamps: true });

// Text index for keyword search
NoteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', NoteSchema);
