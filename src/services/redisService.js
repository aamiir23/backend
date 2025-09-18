// backend/src/services/redisService.js

const { redisClient } = require('../config/redisClient');
const { JsonCommands } = require('@redis/json'); // Correct package import

const getSessionHistory = async (sessionId) => {
  const history = await redisClient.json.get(`session:${sessionId}`, '$');
  return history ? history[0] : [];
};

const addMessageToHistory = async (sessionId, role, content) => {
  const key = `session:${sessionId}`;
  
  // Check if the key exists and if it's not a JSON array
  const type = await redisClient.type(key);
  if (type === 'none') {
    // If the session key doesn't exist, create it as a JSON array
    await redisClient.json.set(key, '$', []);
  }

  await redisClient.json.arrAppend(key, '$', { role, content, timestamp: new Date().toISOString() });
  
  await redisClient.expire(key, 86400); 
};

const clearSessionHistory = async (sessionId) => {
  await redisClient.del(`session:${sessionId}`);
};

module.exports = { getSessionHistory, addMessageToHistory, clearSessionHistory };