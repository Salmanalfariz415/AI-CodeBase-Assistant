# AI CodeBase Assistant - System Architecture

## Project Overview
A full-stack application that analyzes GitHub repositories by cloning them, breaking code into chunks, generating embeddings using OpenAI, storing them in Supabase vector database, and providing semantic search capabilities.

---

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                        Port: 5173                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  main.jsx ──→ App.jsx ──→ Home.jsx (Pages)                      │
│                           ├─ UrlForm.jsx (Component)            │
│                           └─ State Management (React Hooks)      │
│                                                                   │
│  ┌─ Input: GitHub URL ──→ handleUrlSubmit()                     │
│  │                         ├─ setLoading(true)                  │
│  │                         ├─ POST /api/link                    │
│  │                         └─ Wait for response                 │
│  │                                                               │
│  └─ Output: Display Repository Details                          │
│             (Name, Description, Stars, Forks, Issues, Language) │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│                        Port: 5000                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  server.js (Main Entry)                                         │
│  ├─ CORS enabled                                                │
│  ├─ JSON body parser                                            │
│  ├─ Error handlers (unhandledRejection, uncaughtException)     │
│  └─ Mount routes at /api                                        │
│                                                                   │
│  routes/github.js                                               │
│  └─ POST /api/link ──→ uploader controller                      │
│                                                                   │
│  controllers/uploader.js (MAIN PIPELINE)                        │
│  ├─ Step 0: Clear Database                                      │
│  │          utils/vectorService.js → clearDatabase()           │
│  │          ├─ Delete ALL chunks from previous repos            │
│  │          ├─ Ensures fresh analysis for each new repo         │
│  │          └─ Prevents cross-repo data contamination           │
│  │                                                               │
│  ├─ Step 1: Git Clone                                           │
│  │          execFile('git clone --depth 1 <url> <targetPath>') │
│  │          Location: backend/cloned_repos/repo-<timestamp>/   │
│  │                                                               │
│  ├─ Step 2: File Chunking                                       │
│  │          utils/chunker.js                                    │
│  │          ├─ getAllFiles() - recursive directory walk        │
│  │          ├─ Filter by code extensions:                       │
│  │          │  .js, .ts, .py, .json, .html, .css, .md          │
│  │          ├─ chunkFileContent() - sliding window chunking     │
│  │          │  └─ chunk size: 1000 chars, overlap: 200 chars   │
│  │          └─ Output: Array of chunk objects with metadata     │
│  │                                                               │
│  ├─ Step 3: Generate Embeddings                                 │
│  │          utils/vectorService.js                              │
│  │          ├─ OpenAI API: text-embedding-3-small               │
│  │          ├─ Model output: 1536-dimension vectors             │
│  │          └─ Append embedding to each chunk                   │
│  │                                                               │
│  ├─ Step 4: Store in Supabase                                   │
│  │          utils/vectorService.js → storeInSupabase()         │
│  │          ├─ Table: code_chunks                               │
│  │          ├─ Columns: id, content, embedding, metadata        │
│  │          └─ Batch insert into pgvector                       │
│  │                                                               │
│  └─ Step 5: Extract Repo Info & Return                          │
│             ├─ Read package.json (if exists)                    │
│             ├─ Extract: name, description                       │
│  │             │                                                    │
│  │             ├─ Step 5.5: AI README Generation (NEW!)            │
│  │             │            ├─ OpenAI GPT-4 API                   │
│  │             │            ├─ Prompt: Analyze repo chunks         │
│  │             │            ├─ Generate comprehensive README       │
│  │             │            │  (Features, Setup, Usage, API docs)  │
│  │             │            └─ Save to GENERATED_README.md         │
│  │             │                                                    │
│  │             └─ Return JSON response with:                       │
│  │                ├─ Repo metadata                                 │
│  │                ├─ totalChunksStored                             │
│  │                └─ generatedReadme (AI-generated content)        │
│                                                                   │
│  controllers/search.js                                          │
│  └─ POST /api/search (Future: semantic search endpoint)         │
│                                                                   │
│  utils/vectorService.js (CORE EMBEDDING LOGIC)                  │
│  ├─ generateEmbeddings()                                        │
│  │  └─ OpenAI text-embedding-3-small                           │
│  ├─ storeInSupabase()                                           │
│  │  └─ Insert chunks with embeddings into pgvector             │
│  └─ searchSimilarChunks()                                       │
│     └─ Query Supabase match_code_chunks() function             │
│                                                                   │
│  utils/chunker.js (FILE PROCESSING)                             │
│  ├─ getAllFiles()                                               │
│  │  ├─ fs.readdirSync() recursive walk                         │
│  │  ├─ Skip: .git, node_modules                                │
│  │  └─ Filter by extension                                      │
│  └─ chunkFileContent()                                          │
│     ├─ fs.readFileSync() read file                             │
│     ├─ Sliding window: size=1000, overlap=200                   │
│     └─ Create chunk objects with metadata                       │
│                                                                   │
│  nodemon.json (Dev Configuration)                               │
│  └─ Watch: controllers, routes, utils, .env                     │
│  └─ Ignore: cloned_repos/**, node_modules/**                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. OpenAI API                                                   │
│     ├─ Endpoint: api.openai.com/v1/embeddings                  │
│     ├─ Model: text-embedding-3-small                            │
│     ├─ Input: Array of text chunks (max batch)                 │
│     └─ Output: 1536-dim vectors                                │
│                                                                   │
│  2. GitHub (Git Clone)                                          │
│     ├─ Protocol: HTTPS via execFile                             │
│     ├─ Depth: 1 (--depth 1 for speed)                          │
│     └─ Output: Local repo files in cloned_repos/               │
│                                                                   │
│  3. Supabase (PostgreSQL + pgvector)                            │
│     ├─ Auth: ANON_KEY for client                                │
│     ├─ Database: PostgreSQL with vector extension               │
│     ├─ Table: code_chunks (vector embeddings)                   │
│     ├─ Function: match_code_chunks() (semantic search)          │
│     └─ Connection: @supabase/supabase-js                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
AI CodeBase Assistant/
├── package.json (root monorepo config)
│
├── frontend/ (React + Vite SPA)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
│   ├── src/
│   │   ├── main.jsx (Entry point)
│   │   ├── App.jsx (Root component)
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── UrlForm.jsx (Input form component)
│   │   └── pages/
│   │       └── Home.jsx (Main page with state management)
│   └── README.md
│
├── backend/ (Node.js + Express API)
│   ├── package.json
│   ├── server.js (Main server file)
│   ├── nodemon.json (Dev watcher config)
│   ├── .env (Environment variables)
│   │   ├── OPENAI_API_KEY
│   │   ├── SUPABASE_URL
│   │   ├── SUPABASE_ANON_KEY
│   │   └── PORT=5000
│   ├── routes/
│   │   └── github.js (API route: POST /api/link)
│   ├── controllers/
│   │   ├── uploader.js (Main pipeline: clone → chunk → embed → store)
│   │   └── search.js (Search controller - not yet integrated)
│   ├── utils/
│   │   ├── chunker.js (File processing & chunking logic)
│   │   ├── vectorService.js (OpenAI embeddings + Supabase operations)
│   │   └── readmeGenerator.js (AI-powered README generation)
│   └── cloned_repos/ (Temporary directory for cloned repos)
│       └── repo-<timestamp>/ (Auto-cleaned after processing)
│
└── .gitignore
```

---

## 🔄 Data Flow - Step by Step

### Phase 1: User Input
```
User Input (Browser)
    ↓
UrlForm Component (text input)
    ↓
Home.jsx: handleUrlSubmit(url)
    ↓
POST http://localhost:5000/api/link
    └─ Body: { url: "https://github.com/user/repo" }
```

### Phase 2: Repository Processing (Backend)
```
1. GIT CLONE
   URL → execFile('git', ['clone', '--depth', '1', url, targetPath])
   └─ Output: Local files in cloned_repos/repo-<timestamp>/

2. FILE DISCOVERY & CHUNKING
   getAllFiles(targetPath)
   ├─ Recursively scan directories
   ├─ Skip: .git, node_modules
   ├─ Filter: .js, .ts, .py, .json, .html, .css, .md
   └─ For each file: chunkFileContent()
       └─ Sliding window: 1000 chars with 200 overlap
           └─ Output: Array of ~63 chunks (for Clinical-CRM)

3. EMBEDDING GENERATION
   allRepositoryChunks (array of chunk objects)
   ├─ Extract text content from each chunk
   └─ OpenAI API: text-embedding-3-small
       └─ Output: 1536-dimensional vectors per chunk

4. VECTOR STORAGE
   embeddedChunks (chunks with .embedding property)
   └─ Supabase: INSERT into code_chunks table
       ├─ Columns: id, content, embedding, metadata, created_at
       └─ pgvector stores embedding vectors

5. AI README GENERATION (NEW!)
   repoChunks (top 20 most relevant chunks)
   └─ OpenAI GPT-4 API: Generate comprehensive README
       ├─ Input: Code snippets from repository
       ├─ Prompt engineering: Specific README sections
       ├─ Output: Markdown-formatted README
       └─ Save to: cloned_repos/repo-<timestamp>/GENERATED_README.md

6. RESPONSE TO FRONTEND
   Backend returns JSON with:
   ├─ name: "clinical-crm"
   ├─ description: "No description"
   ├─ url: "https://github.com/Salmanalfariz415/Clinical-CRM"
   ├─ stars, forks, issues: 0
   ├─ language: "Mixed"
   ├─ message: "Repository successfully processed!"
   ├─ totalChunksStored: 63
   └─ generatedReadme: "# Clinical CRM\n\n## Overview\n..."
```

### Phase 3: Display Results (Frontend)
```
Response received
    ↓
setRepoData(response)
setLoading(false)
    ↓
Render Repository Details Component
├─ Show URL
├─ Show name, description
├─ Show stars, forks, issues
├─ Show language
├─ Link to GitHub
└─ Display totalChunksStored
```

---

## 🔐 Environment Variables

**Backend (.env in /backend)**
```
OPENAI_API_KEY=sk-proj-xxxxx...  # OpenAI API key
SUPABASE_URL=https://xxx.supabase.co  # Supabase project URL
SUPABASE_ANON_KEY=eyJhbGc...  # Supabase anonymous key
PORT=5000  # Backend server port
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite 8 | SPA, fast builds, HMR |
| **Frontend Port** | 5173 | Development server |
| **Backend** | Node.js + Express 5 | REST API server |
| **Backend Port** | 5000 | API endpoint |
| **File Processing** | fs (Node.js) | Read/scan directories |
| **Process Execution** | child_process.execFile | Safe git clone |
| **AI/ML** | OpenAI API | text-embedding-3-small |
| **Embeddings** | Vector (1536-dim) | Semantic representation |
| **Database** | Supabase PostgreSQL | pgvector extension |
| **Vector Search** | pgvector SQL function | match_code_chunks() |
| **Dev Tools** | Nodemon | Auto-restart on changes |
| **CORS** | cors package | Cross-origin requests |

---

## 🔌 API Endpoints

### Current Endpoints

**POST /api/link**
- **Purpose**: Clone repository, chunk files, generate embeddings, store in Supabase
- **Request Body**:
  ```json
  {
    "url": "https://github.com/user/repo"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "name": "repo-name",
    "description": "repo description",
    "url": "https://github.com/user/repo",
    "stars": 0,
    "forks": 0,
    "issues": 0,
    "language": "Mixed",
    "message": "Repository successfully processed!",
    "totalChunksStored": 63
  }
  ```
- **Error Response** (500):
  ```json
  {
    "error": "Clone failed | Pipeline failed",
    "details": "error message"
  }
  ```

### Future Endpoints (Planned)

**POST /api/search**
- Purpose: Semantic search across embedded code chunks
- Request: `{ "query": "authentication logic" }`
- Response: Top 3 matching code chunks with similarity scores

---

## 📊 Data Models

### Chunk Object (Before Embedding)
```javascript
{
  id: "filename-chunk-0",
  content: "const func = () => {...}",
  metadata: {
    fileName: "server.js",
    filePath: "/full/path/to/server.js",
    language: "js",
    startIndex: 0
  }
}
```

### Chunk Object (After Embedding)
```javascript
{
  id: "filename-chunk-0",
  content: "const func = () => {...}",
  embedding: [0.123, -0.456, 0.789, ...], // 1536 values
  metadata: {
    fileName: "server.js",
    filePath: "/full/path/to/server.js",
    language: "js",
    startIndex: 0
  }
}
```

### Supabase Table: code_chunks
```sql
id (bigserial, primary key)
content (text) - The actual code text
embedding (vector(1536)) - OpenAI embedding vector
metadata (jsonb) - File info and context
created_at (timestamp) - Auto-generated timestamp
```

---

## ⚡ Performance Considerations

| Issue | Solution |
|-------|----------|
| Long processing time | Git clone: `--depth 1` (shallow), Chunking: parallel processing possible |
| High OpenAI costs | Use text-embedding-3-small (cheapest), batch embeddings |
| Temporary file cleanup | Use timestamps, implement auto-delete after processing |
| Nodemon restarts | nodemon.json ignores cloned_repos/ to prevent restarts |
| CORS issues | cors() middleware enabled in server |
| Large repos | Stream processing, pagination support can be added |

---

## 🔍 Error Handling

| Layer | Error Type | Resolution |
|-------|-----------|-----------|
| **Frontend** | Network error | Display error message, retry button |
| | 500 Server error | Display details from backend |
| **Backend** | Git clone fails | Return 500 with stderr details |
| | File read fails | Try/catch, log, continue to next file |
| | OpenAI API fails | Return 500 with error message |
| | Supabase insert fails | Return 500 with Supabase error |
| **Server** | Unhandled rejection | Global error handler logs and continues |
| | Uncaught exception | Global error handler logs and continues |

---

## 📈 Processing Pipeline Example (Clinical-CRM)

```
Input: https://github.com/Salmanalfariz415/Clinical-CRM

Step 1: Clone
└─ Time: ~2-3s
└─ Output: 754 files in cloned_repos/repo-1784839562502/

Step 2: Filter Files
├─ Total files: 754
├─ Code files: 10
│  ├─ appointController.js (3 chunks)
│  ├─ authController.js (3 chunks)
│  ├─ PatientControllers.js (4 chunks)
│  ├─ authMiddleware.js (1 chunk)
│  ├─ appointRoutes.js (1 chunk)
│  ├─ authRoutes.js (1 chunk)
│  ├─ patientRoutes.js (1 chunk)
│  ├─ server.js (1 chunk)
│  ├─ package-lock.json (47 chunks)
│  └─ package.json (1 chunk)
└─ Total chunks: 63

Step 3: Generate Embeddings
├─ Time: ~2-5s (API dependent)
├─ Chunks: 63
└─ Output: 63 x 1536-dim vectors

Step 4: Store in Supabase
├─ Time: ~1-2s
├─ Rows inserted: 63
└─ Status: SUCCESS or FAILED (if DB paused)

Step 5: Return to Frontend
├─ name: "clinical-crm"
├─ description: "No description"
├─ totalChunksStored: 63
└─ Display on UI
```

---

## 🚀 Deployment Notes

**Frontend**: Deploy to Vercel, Netlify, or S3 (static)
**Backend**: Deploy to Heroku, Railway, or AWS Lambda
**Database**: Supabase hosted PostgreSQL (auto-provisioned)
**Embeddings**: OpenAI API (pay-per-use)

Make sure to:
1. Use environment variables in production
2. Set appropriate rate limits
3. Implement cleanup for old cloned repos
4. Monitor OpenAI API costs
5. Keep Supabase project active (not paused)

---

This architecture supports future enhancements like caching, pagination, advanced search filters, and multi-user support!
