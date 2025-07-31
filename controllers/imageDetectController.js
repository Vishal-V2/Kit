const axios = require('axios');

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

exports.detectAIFromImageUrl = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Image URL is required' });
    
    try {
        console.log('[1] Downloading image from URL:', url);
        const imageType = (await import('image-type')).default;
        const imageRes = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const buffer = Buffer.from(imageRes.data);
        const type = imageType(buffer);

        if (!type || !type.mime.startsWith('image/')) {
            return res.status(400).json({ error: 'Invalid image format.' });
        }

        const imageBase64 = buffer.toString('base64');
        if (imageBase64.length > 180000) {
            return res.status(400).json({ error: 'Image too large for direct upload. Use NVIDIA assets API.' });
        }

        console.log('[2] Preparing request to NVIDIA Phi-3.5 Vision...');

        const payload = {
            model: "microsoft/phi-3.5-vision-instruct",
            messages: [
                {
                    role: "user",
                    content: `On a scale of 0 to 100, what is the likelihood that this image is AI-generated? Return only the number.\n<img src="data:${type.mime};base64,${imageBase64}" />`
                }
            ],
            max_tokens: 10,
            temperature: 0.2,
            top_p: 0.7,
            stream: false
        };

        const headers = {
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
            Accept: "application/json"
        };

        const response = await axios.post(invokeUrl, payload, {
            headers: headers
        });

        const text = response.data.choices?.[0]?.message?.content?.trim();

        const match = text.match(/(\d{1,3})/);
        const percent = match ? Math.min(100, parseInt(match[1])) : null;

        console.log('[3] NVIDIA Response:', text);

        res.json({
            aiLikelihoodPercent: percent,
            rawModelReply: text
        });

    } catch (err) {
        console.error('[ERROR] Image analysis via NVIDIA failed:', err.message);
        if (err.response?.data) {
            console.error(err.response.data);
        }
        res.status(500).json({ error: 'Image detection failed', details: err.message });
    }
};
