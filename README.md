# PDF Semantic Search using Mistral AI Embeddings and Pinecone

## Overview

This project demonstrates how to build a semantic search system using **Node.js**, **Mistral AI Embeddings**, and **Pinecone**. Instead of searching for exact keywords, the system understands the meaning of the query and retrieves the most relevant text from a PDF document.

---

## Workflow

```
PDF File
    │
    ▼
Read PDF
(pdf-parse)
    │
    ▼
Extract Text
    │
    ▼
Split Text into Chunks
(RecursiveCharacterTextSplitter)
    │
    ▼
Generate Embeddings
(Mistral AI Embeddings)
    │
    ▼
Store Vectors
(Pinecone Vector Database)
    │
    ▼
User Query
    │
    ▼
Generate Query Embedding
    │
    ▼
Similarity Search
(Pinecone)
    │
    ▼
Retrieve Most Relevant Chunks
```

---

## Step 1: Read the PDF

The PDF is loaded from the local system using the `pdf-parse` package.

```javascript
const bufferData = fs.readFileSync("./sample.pdf");
```

The parser extracts all text from the PDF.

```javascript
const pdf = await parser.getText();
```

Output:

```
Raw text extracted from the PDF.
```

---

## Step 2: Split the Text

Large documents cannot be embedded efficiently, so the text is divided into smaller overlapping chunks.

```javascript
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});
```

Example:

```
Chunk 1
Chunk 2
Chunk 3
...
Chunk N
```

Each chunk contains approximately 1000 characters with an overlap of 200 characters to preserve context.

---

## Step 3: Generate Embeddings

Each chunk is converted into a numerical vector using the Mistral embedding model.

```javascript
const vectors = await embeddings.embedDocuments(allSplits);
```

Example:

```
Chunk 1
↓

[0.23, -0.44, 0.91, ...]

Chunk 2
↓

[-0.14, 0.67, 0.11, ...]
```

Every chunk receives its own embedding vector.

---

## Step 4: Store Embeddings in Pinecone

Each vector is uploaded to Pinecone with metadata.

```javascript
{
    id: "chunk-0",
    values: embeddingVector,
    metadata: {
        data: chunkText
    }
}
```

Example:

```
chunk-0
│
├── Vector
└── Metadata
      └── data
```

The metadata stores the original text, allowing it to be retrieved later.

---

## Step 5: Search

When a user enters a query such as:

```
learning programming fundamentals
```

the query is converted into an embedding.

```
Query
↓

Embedding
↓

[0.42, -0.81, 0.55, ...]
```

---

## Step 6: Similarity Search

Pinecone compares the query vector against all stored document vectors.

```
Query Vector
        │
        ├──────── Compare ──────── Chunk 1
        ├──────── Compare ──────── Chunk 2
        ├──────── Compare ──────── Chunk 3
        └──────── Compare ──────── Chunk N
```

Pinecone calculates similarity scores (typically cosine similarity) and returns the closest matches.

Example:

| Chunk   | Similarity Score |
| ------- | ---------------- |
| chunk-5 | 0.96             |
| chunk-2 | 0.93             |
| chunk-9 | 0.89             |

---

## Step 7: Retrieve the Result

The stored metadata is returned.

```json
{
    "id": "chunk-5",
    "score": 0.96,
    "metadata": {
        "data": "Programming fundamentals include variables, loops, functions..."
    }
}
```

The application displays the text from `metadata.data` as the search result.

---

# Project Structure

```
project/
│
├── sample.pdf
├── index.js
├── .env
├── package.json
└── README.md
```

---

# Environment Variables

```
MISTRAL_API_KEY=xxxxxxxxxxxxxxxx
PINECONE_API_KEY=xxxxxxxxxxxxxxxx
PINECONE_INDEX_NAME=my-index
```

---

# Install Dependencies

```bash
npm install
```

or

```bash
npm install pdf-parse dotenv @langchain/textsplitters @langchain/mistralai @pinecone-database/pinecone
```

---

# Run

```bash
node index.js
```

---

# Technologies Used

* Node.js
* pdf-parse
* LangChain
* RecursiveCharacterTextSplitter
* Mistral AI Embeddings
* Pinecone Vector Database
* dotenv

---

# Example Search

Input:

```
learning programming fundamentals
```

Output:

```
Programming fundamentals include variables, data types, loops, functions, object-oriented programming, and problem-solving techniques.
```

---

# Summary

This project follows a complete Retrieval-Augmented Generation (RAG) indexing workflow:

1. Read the PDF.
2. Extract text.
3. Split the text into chunks.
4. Generate embeddings for every chunk.
5. Store embeddings in Pinecone with metadata.
6. Convert the user's query into an embedding.
7. Perform semantic similarity search.
8. Return the most relevant chunks based on vector similarity.

This pipeline enables fast and accurate semantic search over PDF documents without relying on exact keyword matching.
