# Groq Summarization Endpoint Setup

This endpoint provides AI-powered content summarization using Groq's API, converting raw text into concise bullet points.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd factora-server
npm install
```

### 2. Environment Setup
Create a `.env` file in the `factora-server` directory:
```bash
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
```

### 3. Get Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 4. Start Server
```bash
npm start
# or
node server.js
```

## 📡 API Endpoint

### POST `/api/summarize`

**Request Body:**
```json
{
  "content": "Your raw text content here..."
}
```

**Response:**
```json
{
  "success": true,
  "summary": "• Key point 1\n• Key point 2\n• Key point 3",
  "model": "llama3-8b-8192",
  "input_length": 1234,
  "summary_length": 567
}
```

## 🧪 Testing

1. Open `test-summarize.html` in your browser
2. Enter or paste content in the textarea
3. Click "Summarize with Groq"
4. View the bullet-point summary

## ⚙️ Configuration

### Model Options
- **llama3-8b-8192** (default) - Fast, efficient for most use cases
- **llama3-70b-8192** - Higher quality, slower
- **mixtral-8x7b-32768** - Good balance of speed/quality

### Parameters
- **temperature**: 0.3 (focused summaries)
- **max_tokens**: 1000 (response length limit)
- **content_limit**: 100,000 characters

## 🔧 Customization

### Change Model
Edit `summarizeController.js`:
```javascript
model: "llama3-70b-8192", // Change this line
```

### Adjust Temperature
```javascript
temperature: 0.1, // Lower = more focused, Higher = more creative
```

### Modify Prompt
```javascript
const prompt = `Your custom prompt here: ${content}`;
```

## 🚨 Error Handling

- **401**: Invalid API key
- **429**: Rate limit exceeded
- **400**: Invalid input (missing content, too long)
- **500**: Server error

## 💡 Use Cases

- Article summarization
- Document summarization
- Meeting notes
- Research paper abstracts
- Long-form content digestion
- Content analysis

## 🔒 Security Notes

- Keep your API key secure
- Don't commit `.env` files to version control
- Consider rate limiting for production use
- Validate input content length

## 📊 Performance

- **Response Time**: 1-5 seconds (depending on content length)
- **Content Limit**: 100,000 characters
- **Summary Length**: Up to 1,000 tokens
- **Rate Limits**: Check Groq's current limits

## 🆘 Troubleshooting

### Common Issues

1. **"Invalid API key"**
   - Check your `.env` file
   - Verify the key is correct
   - Ensure no extra spaces

2. **"Rate limit exceeded"**
   - Wait a few minutes
   - Check your Groq usage limits

3. **"Content too long"**
   - Split content into smaller chunks
   - Use the 100,000 character limit

4. **Server not starting**
   - Check if port 5000 is available
   - Verify all dependencies are installed

### Debug Mode
Add logging to see detailed API calls:
```javascript
console.log('Groq API Response:', completion);
```
