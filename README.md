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

## Demo: Inputs & Outputs

Below is a minimal dataset + example calls and responses so you can verify both search modes quickly.

### Seed notes (create from UI or API)

**Note 1**
```json
{
  "title": "Meeting with product team",
  "content": "We discussed new AI features for the dashboard and planned a Q4 launch.",
  "tags": ["meeting", "product"]
}
```

**Note 2**
```json
{
  "title": "Grocery List",
  "content": "Milk, bread, bananas, green tea, and eggs",
  "tags": ["personal", "shopping"]
}
```

**Note 3**
```json
{
  "title": "AI Research Ideas",
  "content": "Investigate semantic search with embeddings. Compare Hugging Face and OpenAI models.",
  "tags": ["ai", "research"]
}
```

> After creating/updating notes with the backend running and `HF_API_KEY` set, embeddings are stored automatically for semantic search.

### A) Keyword search (MongoDB text index)

**Request**
```
GET /api/search?query=AI&mode=keyword
Authorization: Bearer <JWT>
```

**Response (example)**
```json
{
  "mode": "keyword",
  "results": [
    {
      "_id": "652c01...",
      "title": "Meeting with product team",
      "content": "We discussed new AI features for the dashboard and planned a Q4 launch.",
      "tags": ["meeting","product"],
      "score": 1.2
    },
    {
      "_id": "652c02...",
      "title": "AI Research Ideas",
      "content": "Investigate semantic search with embeddings. Compare Hugging Face and OpenAI models.",
      "tags": ["ai","research"],
      "score": 0.9
    }
  ]
}
```

### B) AI semantic search (embeddings + cosine similarity)

**Request**
```
GET /api/search?query=shopping list&mode=semantic
Authorization: Bearer <JWT>
```

**Response (example)**
```json
{
  "mode": "semantic",
  "results": [
    {
      "_id": "652c03...",
      "title": "Grocery List",
      "content": "Milk, bread, bananas, green tea, and eggs",
      "tags": ["personal","shopping"],
      "score": 0.94
    },
    {
      "_id": "652c01...",
      "title": "Meeting with product team",
      "content": "We discussed new AI features for the dashboard and planned a Q4 launch.",
      "tags": ["meeting","product"],
      "score": 0.12
    }
  ]
}
```

### (Optional) Sentence Similarity mode

If you prefer to avoid storing embeddings, you can switch the semantic branch to call the **Sentence Similarity** pipeline instead and send:

```json
{
  "inputs": {
    "source_sentence": "shopping list",
    "sentences": [
      "Milk, bread and eggs",
      "We discussed AI features",
      "Team offsite next week"
    ]
  }
}
```

**Response (example)** — array of similarity scores in the same order as `sentences`:
```json
[0.91, 0.08, 0.05]
```

> This approach is easy to demo but less scalable because each search sends all note texts to the API. The default embedding approach is better for frequent searches.

---

## How it works

### Keyword search
- We define a MongoDB **text index** on `title` and `content` (`models/Note.js`).
- Endpoint: `GET /api/search?query=...&mode=keyword`
- Uses `$text` search with a relevance score; results sorted by `textScore`.

### Semantic search
- Endpoint: `GET /api/search?query=...&mode=semantic`
- Backend hits Hugging Face Inference API (feature-extraction) to get a vector embedding for the **query**.
- Each note stores an embedding (on create/update). We compute **cosine similarity** in Node.js and sort.

> Tip: If you add `HF_API_KEY` later, just edit & save a note to generate its embedding. You can also write a small script to re-embed all notes.

### Security
- JWT-based auth (`/api/auth/register`, `/api/auth/login`).
- React stores token in context/localStorage and attaches it to API requests.
- Express middleware validates tokens for protected endpoints.

---

## Tech stack
- **Backend:** Express, Mongoose, JWT, Axios
- **Frontend:** Vite + React + Tailwind
- **AI:** Hugging Face Inference API (free) with `sentence-transformers/all-MiniLM-L6-v2`

---

## Notes
- Free tiers (MongoDB/Hugging Face) have quotas; for production, consider managed vector DBs or MongoDB Atlas Vector Search.
- Current semantic search ranks in-memory; good for small–medium note counts.
- Prefer OpenAI/Cohere/Voyage embeddings? Swap `backend/utils/embedding.js` accordingly.
