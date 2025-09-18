const { QdrantClient } = require('@qdrant/js-client-rest');
require('dotenv').config();
const { generateEmbeddings } = require('./embeddingService');
const axios = require('axios'); // Add axios for news fetching

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'news_articles';

/**
 * Ensures the Qdrant collection exists. Creates it if it doesn't.
 */
const ensureCollectionExists = async () => {
  try {
    const collection = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log(`Collection '${COLLECTION_NAME}' already exists.`);
  } catch (error) {
    if (error.status === 404) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 768, // Jina-embeddings-v2-base-en has a dimension of 768
          distance: 'Cosine',
        },
      });
      console.log(`Collection '${COLLECTION_NAME}' created.`);
    } else {
      console.error('Error checking/creating collection:', error);
      throw error;
    }
  }
};

/**
 * Inserts news articles into the Qdrant collection after embedding.
 * @param {Array<Object>} articles - An array of news article objects.
 */
const upsertArticles = async (articles) => {
  try {
    const texts = articles.map(a => a.content);
    const embeddings = await generateEmbeddings(texts);
    if (!embeddings) {
      throw new Error('Failed to generate embeddings.');
    }

    const points = articles.map((article, index) => ({
      id: index, // Simple ID for demonstration
      vector: embeddings[index].embedding,
      payload: {
        title: article.title,
        content: article.content,
        url: article.url,
      },
    }));

    await qdrantClient.upsert(COLLECTION_NAME, { points });
    console.log(`Successfully upserted ${articles.length} articles into Qdrant.`);
  } catch (error) {
    console.error('Error upserting articles:', error);
  }
};

/**
 * Searches for relevant articles based on a user query.
 * @param {string} query - The user's input query.
 * @returns {Array<Object>} An array of relevant article payloads.
 */
const searchArticles = async (query) => {
  try {
    const queryEmbedding = (await generateEmbeddings([query]))[0].embedding;
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 3, // Retrieve top-k passages
      withPayload: true,
    });
    return searchResult.map(result => result.payload);
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
};

/**
 * Fetches and ingests a news corpus. This function should be called once.
 */
const ingestNewsCorpus = async () => {
  console.log('Starting news ingestion...');
  // In a real-world scenario, you would scrape news from a source.
  // Here, we'll use a mock array of articles.
  // For a more robust solution, you would use a web scraper library to fetch from RSS feeds or sitemaps.
  
  const newsCorpus = [
    {
      title: "Google introduces new AI model, Gemini",
      content: "Google has announced the release of its most capable and flexible AI model yet, Gemini, which is designed to be multimodal and highly efficient.",
      url: "https://www.google.com/news/gemini"
    },
    {
      title: "Global markets react to central bank decisions",
      content: "Stock markets worldwide saw mixed reactions following the latest interest rate decisions by major central banks, impacting tech and energy sectors.",
      url: "https://www.reuters.com/markets"
    },
    {
      title: "New study reveals benefits of walking",
      content: "Researchers have published a new study in a medical journal highlighting the profound health benefits of regular daily walking, including improved cardiovascular health.",
      url: "https://www.medicalnews.com/walking-benefits"
    },
    {
      title: "Latest advancements in quantum computing",
      content: "Scientists have made significant strides in increasing the stability of qubits, bringing the world closer to practical quantum computing for complex simulations.",
      url: "https://www.techjournal.com/quantum"
    },
    // Add 46 more articles here to meet the ~50 article requirement.
    {
      title: "World leaders meet for climate summit",
      content: "A major climate summit is underway, with heads of state discussing new targets for reducing carbon emissions and transitioning to renewable energy sources.",
      url: "https://www.cnn.com/climate-summit"
    }
  ];

  await ensureCollectionExists();
  await upsertArticles(newsCorpus);
  console.log('News ingestion complete.');
};


module.exports = { ensureCollectionExists, upsertArticles, searchArticles, ingestNewsCorpus };

// Uncomment and run this line once to ingest your news data.
ingestNewsCorpus();