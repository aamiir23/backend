const express = require('express');
const { handleChat, getHistory, resetSession } = require('../controllers/chatController');

const router = express.Router();

router.post('/', handleChat);
router.get('/:sessionId', getHistory);
router.delete('/:sessionId', resetSession);

module.exports = router;