# AI-Powered GitHub Repository Analyzer

An AI-powered application that analyzes GitHub repositories using Retrieval-Augmented Generation (RAG). The system clones a repository, processes its source code, generates vector embeddings using OpenAI, stores them in Supabase (pgvector), and automatically generates a comprehensive README.

---

## Features

- Clone any public GitHub repository
- Extract and process source code files
- Chunk large files using a sliding window approach
- Generate vector embeddings with OpenAI
- Store embeddings in Supabase (pgvector)
- Automatically generate AI-powered README documentation
- Repository metadata extraction
- Prevent cross-repository data contamination by clearing previous embeddings
- Scalable architecture for semantic search (future implementation)

---

## Tech Stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express.js

### AI
- OpenAI API
- text-embedding-3-small
- GPT-4

### Database
- Supabase
- PostgreSQL
- pgvector

### Other Libraries
- Axios
- Cheerio
- dotenv
- CORS
- Nodemon

---

## Project Structure

```
project/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   ├── cloned_repos/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── App.jsx
│
└── README.md
```

---

# Installation

## Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

---

## Backend Setup

Initialize npm

```bash
npm init -y
```

Install Express, CORS and Dotenv

```bash
npm install express cors dotenv
```

Install Nodemon (Development)

```bash
npm install -D nodemon
```

Nodemon automatically restarts the Node.js server whenever source files change during development.

Install Axios and Cheerio

```bash
npm install axios cheerio
```

- **Axios** is used for making HTTP requests.
- **Cheerio** parses HTML and extracts repository information through web scraping when required.

Install OpenAI

```bash
npm install openai
```

Used to

- Generate embeddings
- Generate AI-powered README documentation

Install Supabase

```bash
npm install @supabase/supabase-js
```

Used to connect to Supabase PostgreSQL and store vector embeddings.

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

OPENAI_API_KEY=your_openai_key

SUPABASE_URL=your_supabase_url

SUPABASE_ANON_KEY=your_supabase_key
```

---

## Running the Project

Start Backend

```bash
npm run dev
```

Start Frontend

```bash
npm run dev
```

---

# How It Works

1. User submits a GitHub repository URL.
2. Repository is cloned locally.
3. Previous vector embeddings are deleted from Supabase.
4. Source files are recursively scanned.
5. Files are chunked using a sliding window.
6. OpenAI generates embeddings for every chunk.
7. Embeddings are stored inside Supabase (pgvector).
8. Repository metadata is extracted.
9. GPT generates a comprehensive README.
10. Repository information and generated README are returned to the frontend.

---

## Supported File Types

- JavaScript (.js)
- TypeScript (.ts)
- Python (.py)
- HTML (.html)
- CSS (.css)
- JSON (.json)
- Markdown (.md)

---

## Future Improvements

- Semantic code search
- Repository question answering
- Multi-repository support
- Repository comparison
- Code summarization
- Interactive AI chat with repository
- Authentication
- Repository history

---

## API Endpoints

### Upload Repository

```
POST /api/link
```

Request

```json
{
    "url":"https://github.com/user/repository"
}
```

---

### Semantic Search (Future)

```
POST /api/search
```

---

## Architecture

```
GitHub URL
      │
      ▼
React Frontend
      │
      ▼
Express Backend
      │
      ▼
Clone Repository
      │
      ▼
Chunk Files
      │
      ▼
Generate Embeddings
      │
      ▼
Store in Supabase
      │
      ▼
Generate README
      │
      ▼
Return Results
```

---

## Author

**Salman Al Fariz**

AI & Full Stack Developer
