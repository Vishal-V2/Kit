const express = require('express');
const router = express.Router();
const { answerQuestion } = require('../controllers/qaController');

// POST /api/qa
// Takes a question and content, returns AI-generated answer from Groq
router.post('/', answerQuestion);

module.exports = router;
