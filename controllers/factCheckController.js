const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// STEP 1: Extract claims from input text
async function extractClaims(text) {
    try {
        console.log('[1] Extracting claims with Gemini...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
Extract clear factual claims from this text. Return them as a plain numbered list:
"""${text}"""
        `;

        const result = await model.generateContent(prompt);
        const raw = await result.response.text();
        const claims = raw
            .split('\n')
            .filter(line => /^\d+[\).]/.test(line))
            .map(line => line.replace(/^\d+[\).]\s*/, '').trim());

        console.log(`[1.1] Found ${claims.length} claims.`);
        return claims;
    } catch (err) {
        console.error('[1-ERROR] Failed to extract claims:', err.message);
        throw new Error('Gemini claim extraction failed');
    }
}

// STEP 2: Search for each claim
async function searchWeb(claim) {
    try {
        console.log(`[2] Searching web for: "${claim}"`);
        const url = 'https://www.googleapis.com/customsearch/v1';
        const params = {
            key: process.env.GOOGLE_SEARCH_API_KEY,
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
            q: claim,
            num: 5
        };

        const { data } = await axios.get(url, { params });
        const items = data.items || [];

        console.log(`[2.1] Found ${items.length} results for claim.`);
        return items.map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet
        }));
    } catch (err) {
        console.error('[2-ERROR] Google search failed:', err.message);
        if (err.response) console.error(err.response.data);
        throw new Error('Google Search API failed');
    }
}

// STEP 3: Ask Gemini to validate claim against search results
async function validateClaimWithGemini(claim, snippets) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are an AI fact-checking assistant.

A claim has been made, and here are 3-5 web snippets found via search engines.
Decide whether the sources support the claim.

Respond with ONLY "true" or "false".

Claim: "${claim}"

Sources:
${snippets.map((s, i) => `${i + 1}. ${s.snippet}`).join('\n')}

Answer:
        `;

        const result = await model.generateContent(prompt);
        const answer = await result.response.text();

        console.log(`[3] Gemini decision:`, answer);
        return answer.toLowerCase().includes("true");
    } catch (err) {
        console.error('[3-ERROR] Gemini validation failed:', err.message);
        return null; // fallback to unknown
    }
}

// STEP 4: Final API endpoint
exports.factCheck = async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    try {
        console.log('[0] Starting full fact-checking process...');
        const claims = await extractClaims(text);
        const results = [];

        for (const claim of claims) {
            const sources = await searchWeb(claim);
            const usedSnippets = sources.slice(0, 5);

            const isLikelyTrue = await validateClaimWithGemini(claim, usedSnippets);

            results.push({
                claim,
                isLikelyTrue,
                supportingSources: usedSnippets.map(s => ({
                    title: s.title,
                    link: s.link
                }))
            });
        }

        console.log('[4] Fact-check complete.');
        res.json({ claims: results });
    } catch (err) {
        console.error('[FATAL]', err.message);
        res.status(500).json({
            error: 'Fact-checking failed',
            details: err.message
        });
    }
};
