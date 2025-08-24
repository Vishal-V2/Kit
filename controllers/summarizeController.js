const axios = require('axios');

exports.summarizeContent = async (req, res) => {
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    try {
        console.log('[1] Sending content to Groq for summarization...');

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert content summarizer. Always provide summaries in clear, concise bullet points."
                    },
                    {
                        role: "user",
                        content: `
Please summarize the following content in the form of clear, concise bullet points. Focus on the key points, main ideas, and important details. Make the summary easy to read and understand:

"""${content}"""

Provide the summary in bullet point format only.`
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

        const summary = response.data.choices[0].message.content.trim();
        console.log('[2] Groq summary generated:', summary.substring(0, 100) + '...');

        res.json({
            success: true,
            summary: summary,
            model: "llama3-8b-8192",
            input_length: content.length,
            summary_length: summary.length
        });

    } catch (err) {
        console.error('[ERROR] Groq summarization failed:', err.message);
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
            error: 'Failed to summarize content',
            details: err.message
        });
    }
};
