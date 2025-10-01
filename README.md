RAG-Powered Chatbot for News Websites (Backend)
This project contains the backend services for a Retrieval-Augmented Generation (RAG) chatbot. It's built with Node.js and Express to provide a robust API for natural language queries over a private corpus of news articles.

1. Tech Stack and Dependencies
Node.js/Express: The backend framework. It provides a fast, non-blocking environment to create a RESTful API for handling HTTP requests from the frontend.

Google Gemini: The Large Language Model (LLM). It acts as the generative core of the chatbot, taking an augmented prompt (with context) to generate a human-like, fact-based response.

Jina Embeddings: The embedding model. It converts text chunks from news articles and user queries into high-dimensional numerical vectors, a crucial step for semantic search.

Qdrant: The vector database. It stores and indexes the text embeddings. As a high-performance vector search engine, it quickly finds the most relevant documents for a given query.

Redis: The in-memory database. It's used for caching per-session chat history. Its fast read/write speeds make it ideal for storing temporary, real-time conversation data.

dotenv: A library for managing environment variables. It securely loads API keys, URLs, and other sensitive configuration details from a .env file into the application's environment.

axios: An HTTP client. It's used to make API calls to external services like Jina Embeddings and for web scraping.

cors: A middleware. It enables Cross-Origin Resource Sharing, allowing the frontend (running on a different port) to securely communicate with the backend.

2. How the Project Works (End-to-End Flow)
News Ingestion: A script fetches a corpus of news articles on the first run. Each article is broken down into text chunks. Jina Embeddings then converts each chunk into a vector and uploads it to a news_articles collection in Qdrant.

User Query: The user submits a query on the frontend. The ChatInterface component sends this query, along with a unique sessionId, to the backend's /api/chat endpoint.

Retrieval: The backend uses Jina Embeddings to convert the user's query into a vector. It then queries the Qdrant database to find the top-k (e.g., 3) most relevant news articles based on vector similarity.

Augmented Generation: The retrieved text from the relevant articles, along with the current chat history fetched from Redis, is formatted into a single, comprehensive prompt. This prompt is then sent to the Google Gemini API.

Response & Caching: Gemini generates a final, coherent response. This response is then stored in Redis to maintain the session history and sent back to the frontend to be displayed to the user.

3. Setup and Installation Guide
Prerequisites: Ensure you have Node.js and npm installed. You will also need a running Redis instance (e.g., using Docker: docker run -p 6379:6379 redis).

Clone the repository:

Bash

git clone <your-backend-repo-url>
cd <project-folder>/backend
Install dependencies:

Bash

npm install


Configuration (.env file):

Create a file named .env in the backend directory.

This file must contain your API keys and URLs. These are loaded into the application using dotenv.

Crucially, do not share this file or commit it to your repository.

Obtain your keys and URLs from the following sources:

GEMINI_API_KEY: Google AI Studio

JINA_API_KEY: Jina Embeddings

QDRANT_API_KEY and QDRANT_URL: Qdrant Cloud or a local instance.

REDIS_URL: redis://localhost:6379 for a local Docker instance.

Data Ingestion: The ingestion process must run once to populate the Qdrant database.

In src/services/qdrantService.js, temporarily uncomment the line that calls ingestNewsCorpus();.

Run the server with node src/index.js.

Once you see "News ingestion complete." in the console, comment the line back out.

Run the Server:

Bash

node src/index.js


The server will be running on http://localhost:3001.
