const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chatRoutes');
const { connectToRedis } = require('./config/redisClient');

// This is the line you must add at the very top of your file
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('RAG News Chatbot Backend is running.');
});

// Connect to Redis and then start the server
connectToRedis().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});