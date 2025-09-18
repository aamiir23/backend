const axios = require('axios');
require('dotenv').config(); // Load the environment variables

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';
const JINA_API_KEY = process.env.JINA_API_KEY; // Use the variable here

const generateEmbeddings = async (texts) => {
  try {
    const response = await axios.post(JINA_API_URL, {
      input: texts,
      model: "jina-embeddings-v2-base-en",
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JINA_API_KEY}`,
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error generating embeddings:', error.response ? error.response.data : error.message);
    return null;
  }
};

module.exports = { generateEmbeddings };