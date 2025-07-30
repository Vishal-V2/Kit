const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Model configuration with fallback
const PRIMARY_MODEL = 'gemini-2.0-flash-exp';
const FALLBACK_MODEL = 'gemini-1.5-flash';

// Helper function to get Gemini model with fallback
async function getGeminiModel(preferPrimary = true) {
    try {
        if (preferPrimary) {
            console.log(`[MODEL] Attempting to use primary model: ${PRIMARY_MODEL}`);
            return genAI.getGenerativeModel({ model: PRIMARY_MODEL });
        } else {
            console.log(`[MODEL] Using fallback model: ${FALLBACK_MODEL}`);
            return genAI.getGenerativeModel({ model: FALLBACK_MODEL });
        }
    } catch (err) {
        console.log(`[MODEL] Error getting model, using fallback: ${err.message}`);
        return genAI.getGenerativeModel({ model: FALLBACK_MODEL });
    }
}

// STEP 1: Extract claims from input text
async function extractClaims(text) {
    let model;
    let usingPrimary = true;
    
    try {
        console.log('[1] Extracting claims with Gemini...');
        model = await getGeminiModel(true);

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

        console.log(`[1.1] Found ${claims.length} claims using ${usingPrimary ? 'primary' : 'fallback'} model.`);
        return claims;
    } catch (err) {
        console.error('[1-ERROR] Failed to extract claims:', err.message);
        
        // Try fallback model if primary failed
        if (usingPrimary) {
            console.log('[1-FALLBACK] Retrying with fallback model...');
            try {
                usingPrimary = false;
                model = await getGeminiModel(false);
                
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

                console.log(`[1.1] Found ${claims.length} claims using fallback model.`);
                return claims;
            } catch (fallbackErr) {
                console.error('[1-FALLBACK-ERROR] Fallback also failed:', fallbackErr.message);
                throw new Error(`Both primary and fallback models failed: ${err.message}`);
            }
        }
        
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
    let model;
    let usingPrimary = true;
    
    try {
        model = await getGeminiModel(true);

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

        console.log(`[3] Gemini decision using ${usingPrimary ? 'primary' : 'fallback'} model:`, answer);
        return answer.toLowerCase().includes("true");
    } catch (err) {
        console.error('[3-ERROR] Gemini validation failed:', err.message);
        
        // Try fallback model if primary failed
        if (usingPrimary) {
            console.log('[3-FALLBACK] Retrying validation with fallback model...');
            try {
                usingPrimary = false;
                model = await getGeminiModel(false);
                
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

                console.log(`[3] Gemini decision using fallback model:`, answer);
                return answer.toLowerCase().includes("true");
            } catch (fallbackErr) {
                console.error('[3-FALLBACK-ERROR] Fallback validation also failed:', fallbackErr.message);
                return null; // fallback to unknown
            }
        }
        
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
