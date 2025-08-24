const express = require('express');
const router = express.Router();
const { summarizeContent } = require('../controllers/summarizeController');

// POST /api/summarize
// Takes raw content and returns bullet point summary from Groq
router.post('/', summarizeContent);

module.exports = router;
