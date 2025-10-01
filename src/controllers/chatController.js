const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchArticles } = require('../services/qdrantService');
const { getSessionHistory, addMessageToHistory, clearSessionHistory } = require('../services/redisService');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

const handleChat = async (req, res) => {
  const { query, sessionId } = req.body;

  if (!query || !sessionId) {
    return res.status(400).json({ error: 'Query and sessionId are required.' });
  }

  try {
    // 1. Retrieval
    const retrievedArticles = await searchArticles(query);
    const context = retrievedArticles.length > 0
      ? retrievedArticles.map(a => `Title: ${a.title}\nContent: ${a.content}`).join('\n\n')
      : 'No relevant articles found.';

    // 2. Augmentation & Generation
    const sessionHistory = await getSessionHistory(sessionId);
    
    // Add a conditional check to ensure sessionHistory is an array
    const historyForGemini = Array.isArray(sessionHistory) ? sessionHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })) : []; // If not an array, default to an empty array

    const prompt = `You are a helpful chatbot that answers questions based on the provided news articles.
    
    News Articles Context:
    ---
    ${context}
    ---
    
    If the question cannot be answered from the provided context, state that you cannot find relevant information. Do not invent facts.
    
    Based on the context and the following user query, provide a detailed and concise answer: ${query}`;

    // Add user message to history
    await addMessageToHistory(sessionId, 'user', query);

    const result = await model.generateContent({
      contents: [...historyForGemini, { role: 'user', parts: [{ text: prompt }] }],
    });

    const botResponse = result.response.text();

    // Add bot response to history
    await addMessageToHistory(sessionId, 'bot', botResponse);

    res.json({ response: botResponse });
  } catch (error) {
    console.error('Error during chat processing:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getHistory = async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required.' });
  }
  try {
    const history = await getSessionHistory(sessionId);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const resetSession = async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required.' });
  }
  try {
    await clearSessionHistory(sessionId);
    res.json({ message: 'Session cleared successfully.' });
  } catch (error) {
    console.error('Error resetting session:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { handleChat, getHistory, resetSession };