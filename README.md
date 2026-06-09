# 🎬 CineGraph-RAG

An AI-powered Movie Knowledge Assistant that combines **Graph Retrieval-Augmented Generation (GraphRAG)**, **Neo4j Knowledge Graphs**, **Pinecone Vector Search**, and **Google Gemini** to answer movie-related questions with context-aware reasoning.

CineGraph-RAG extracts entities and relationships from movie datasets, stores them in a graph database, indexes semantic embeddings in Pinecone, and uses Gemini to generate intelligent responses.

---

## 🚀 Features

### 🎥 Movie Knowledge Graph

* Stores movie entities and relationships in Neo4j
* Connects actors, directors, genres, and movies
* Supports graph traversal and relationship exploration

### 🧠 GraphRAG Pipeline

* Entity extraction
* Knowledge graph construction
* Query classification
* Entity resolution
* Cypher query generation
* Semantic retrieval

### 🔍 Hybrid Search

* Knowledge Graph Search (Neo4j)
* Vector Similarity Search (Pinecone)
* Gemini-powered reasoning

### 📄 PDF Knowledge Ingestion

* Parse movie-related PDFs
* Extract entities automatically
* Build graph relationships
* Generate embeddings for retrieval

### 💬 Interactive Chat Interface

* Modern React frontend
* Real-time responses
* Query processing visualization
* Entity badges
* Pipeline status tracking

---

# 🏗️ Architecture

```text
User Query
    │
    ▼
React Frontend
    │
    ▼
Express Backend
    │
 ┌──┴───────────────┐
 │                  │
 ▼                  ▼
Neo4j           Pinecone
Graph DB        Vector DB
 │                  │
 └──────┬───────────┘
        ▼
Google Gemini
        ▼
Generated Answer
```

---

# 📂 Project Structure

```text
cine-graph-rag/
│
├── backend/
│   ├── 1_testConnection.js
│   ├── 2_config.js
│   ├── 3_pdfParser.js
│   ├── 4_entityExtractor.js
│   ├── 5_graphBuilder.js
│   ├── 6_vectorStore.js
│   ├── 7_runIndexing.js
│   ├── 8_cypherTemplates.js
│   ├── 9_entityResolver.js
│   ├── 10_queryClassifier.js
│   ├── 11_graphHandler.js
│   ├── 12_similarityHandler.js
│   ├── 13_runQuery.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ChatWindow.jsx
│       │   ├── EntityBadges.jsx
│       │   ├── InputBar.jsx
│       │   ├── PipelineSteps.jsx
│       │   └── ThemeToggle.jsx
│       │
│       ├── services/
│       ├── assets/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
└── README.md
```

---

# ⚙️ Tech Stack

## Frontend

* React.js
* Vite
* CSS
* Axios

## Backend

* Node.js
* Express.js
* CORS
* dotenv

## AI & RAG

* Google Gemini API
* LangChain
* GraphRAG

## Databases

* Neo4j
* Pinecone

## Document Processing

* PDF Parser

---

# 📦 Installation

## Clone Repository

```bash
git clone https://github.com/Pranshu51/cine-graph-rag.git

cd cine-graph-rag
```

---

# Backend Setup

```bash
cd backend

npm install
```

Create `.env`

```env
GEMINI_API_KEY=your_api_key

NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password

PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=your_index_name
```

Run Connection Test

```bash
npm test
```

Run Indexing Pipeline

```bash
npm run index
```

Run Query Engine

```bash
npm run query
```

Start Backend Server

```bash
npm run server
```

---

# Frontend Setup

```bash
cd frontend/frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

# 🔄 GraphRAG Pipeline

### 1. PDF Parsing

```text
3_pdfParser.js
```

Extracts text from movie documents.

### 2. Entity Extraction

```text
4_entityExtractor.js
```

Identifies:

* Movies
* Actors
* Directors
* Genres

### 3. Graph Construction

```text
5_graphBuilder.js
```

Creates Neo4j nodes and relationships.

### 4. Vector Embeddings

```text
6_vectorStore.js
```

Stores semantic vectors in Pinecone.

### 5. Query Processing

```text
10_queryClassifier.js
```

Determines query type.

### 6. Entity Resolution

```text
9_entityResolver.js
```

Maps user entities to graph entities.

### 7. Retrieval

```text
11_graphHandler.js
12_similarityHandler.js
```

Performs graph and vector search.

### 8. Response Generation

```text
13_runQuery.js
```

Combines retrieved context and generates answers using Gemini.

---

# 💡 Example Queries

* Who directed Interstellar?
* Movies starring Leonardo DiCaprio.
* Which actors frequently worked with Christopher Nolan?
* Recommend movies similar to Inception.
* Science fiction movies released after 2015.
* Movies with both Tom Hanks and Steven Spielberg.

---

# 🎯 Future Improvements

* Graph visualization dashboard
* Multi-agent movie research
* Recommendation engine
* User authentication
* Watchlist generation
* Movie sentiment analysis
* Streaming platform integration

---

# 👨‍💻 Author

Pranshu Tiwari

GitHub:
https://github.com/Pranshu51

---

# ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

🤝 Contribute to development
