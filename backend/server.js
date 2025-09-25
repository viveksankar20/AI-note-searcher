const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const searchRoutes = require('./routes/search');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_note_searcher';
mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('Mongo connection error', err);
});

app.get('/', (req, res) => {
  res.json({ ok: true, msg: 'AI Note Searcher API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/search', searchRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
