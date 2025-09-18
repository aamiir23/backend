const { createClient } = require('redis');
require('dotenv').config(); // Load the environment variables

const redisClient = createClient({
  url: process.env.REDIS_URL, // Use the variable here
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function connectToRedis() {
  await redisClient.connect();
  console.log('Connected to Redis');
}

module.exports = { redisClient, connectToRedis };