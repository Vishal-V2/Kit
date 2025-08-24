const axios = require('axios');

exports.answerQuestion = async (req, res) => {
    const { question, content } = req.body;
    
    if (!question || !content) {
        return res.status(400).json({ error: 'Both question and content are required' });
    }

    try {
        console.log('[1] Sending question and content to Groq for Q&A...');

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert AI assistant that answers questions based on the provided content. Provide clear, accurate, and helpful answers. If the content doesn't contain enough information to answer the question, say so. Always base your answers on the given content."
                    },
                    {
                        role: "user",
                        content: `
Question: ${question}

Content to analyze:
"""${content}"""

Please provide a clear and accurate answer based on the content above. If the content doesn't contain enough information to answer the question completely, acknowledge this limitation.`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const answer = response.data.choices[0].message.content.trim();
        console.log('[2] Groq Q&A response generated:', answer.substring(0, 100) + '...');

        res.json({
            success: true,
            question: question,
            answer: answer,
            model: "llama3-8b-8192",
            content_length: content.length,
            answer_length: answer.length
        });

    } catch (err) {
        console.error('[ERROR] Groq Q&A failed:', err.message);
        if (err.response) console.error(err.response.data);
        
        // Handle specific Groq API errors
        if (err.response?.status === 401) {
            return res.status(401).json({
                success: false,
                error: 'Invalid Groq API key. Please check your configuration.'
            });
        }
        
        if (err.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to answer question',
            details: err.message
        });
    }
};
