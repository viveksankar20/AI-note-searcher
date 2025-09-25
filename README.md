# AI-Powered Note Searcher

Express + MongoDB + JWT backend, and Vite + React + Tailwind frontend.
Supports **keyword search** (MongoDB text index) and **AI semantic search** (Hugging Face Inference API embeddings).

---

## Quick Start

### 0) Prereqs
- Node.js 18+ and npm
- A free MongoDB Atlas cluster (or local MongoDB)
- A free Hugging Face Access Token (for embeddings)

### 1) Get a free Hugging Face API key (token)
1. Go to https://huggingface.co/ and create a free account.
2. Click your avatar → **Settings** → **Access Tokens**.
3. Click **New token**, give it a name (e.g., `ai-note-searcher`) and choose role **Read**.
4. Copy the token (it starts with `hf_...`). You’ll put this in the backend `.env` as `HF_API_KEY`.

> We use model `sentence-transformers/all-MiniLM-L6-v2` through the free Inference API. The free tier has rate limits.

### 2) Create a free MongoDB Atlas cluster
1. Go to https://www.mongodb.com/atlas/database and create a free **M0** cluster.
2. Create a database user with username/password.
3. Network Access → allow your IP (or 0.0.0.0/0 for testing).
4. Click **Connect** → **Drivers** and copy the **connection string**.
5. In `backend/.env`, set:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/ai_note_searcher?retryWrites=true&w=majority
   JWT_SECRET=supersecretchangeme
   HF_API_KEY=hf_xxx_your_token_here
   ```

### 3) Install & run backend
```bash
cd backend
cp .env.example .env   # edit it with your values
npm install
npm run dev            # or: npm start
# Server at http://localhost:4000
```

### 4) Install & run frontend
```bash
cd ../frontend
npm install
# set API base if your backend is not on http://localhost:4000
# Create a .env file and put: VITE_API_BASE=http://localhost:4000/api
npm run dev
# Frontend at http://localhost:5173
```

### 5) Use the app
- Register, then login.
- Create notes.
- Use the **Search** card: enter a query and switch **Keyword** or **AI (Semantic)**.
- Results show the best match first; AI mode uses cosine similarity on embeddings.

---

## How it works

### Keyword search
- We define a MongoDB **text index** on `title` and `content` (`models/Note.js`).
- Endpoint: `GET /api/search?query=...&mode=keyword`
- Uses `$text` search with a relevance score; results sorted by `textScore`.

### Semantic search
- Endpoint: `GET /api/search?query=...&mode=semantic`
- Backend hits Hugging Face Inference API (feature-extraction pipeline) to get a vector embedding for the **query**.
- We pre-store an embedding for each note (created/updated) and compute **cosine similarity** in Node.js, then sort.

> Tip: You can re-embed existing notes by updating them (or write a small script) if you added the HF key later.

### Security
- JWT-based auth (`/api/auth/register`, `/api/auth/login`).
- React stores token in `localStorage` and attaches it to API requests.
- Express middleware validates tokens for protected endpoints.

---

## Tech stack
- **Backend:** Express, Mongoose, JWT, Axios
- **Frontend:** Vite + React + Tailwind
- **AI:** Hugging Face Inference API (free) with `sentence-transformers/all-MiniLM-L6-v2`

---

## Notes
- Free tiers (MongoDB/Hugging Face) have quotas; for production, consider managed vector DBs or MongoDB Atlas Vector Search.
- The current semantic search fetches your notes, computes similarity in-memory (fine for small–medium note counts).
- If you prefer OpenAI/Cohere/Voyage embeddings, swap the code in `backend/utils/embedding.js`.
