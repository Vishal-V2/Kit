# Groq Q&A Endpoint Setup

This endpoint provides AI-powered question answering using Groq's API, allowing users to ask questions about specific content and receive intelligent answers.

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

### POST `/api/qa`

**Request Body:**
```json
{
  "question": "What are the main benefits of AI?",
  "content": "Your content text here..."
}
```

**Response:**
```json
{
  "success": true,
  "question": "What are the main benefits of AI?",
  "answer": "Based on the content provided, the main benefits of AI include...",
  "model": "llama3-8b-8192",
  "content_length": 1234,
  "answer_length": 567
}
```

## 🧪 Testing

1. Open `test-qa.html` in your browser
2. Enter content in the first textarea
3. Type your question in the second input
4. Click "Ask Groq AI"
5. View the AI-generated answer

## ⚙️ Configuration

### Model Options
- **llama3-8b-8192** (default) - Fast, efficient for most use cases
- **llama3-70b-8192** - Higher quality, slower
- **mixtral-8x7b-32768** - Good balance of speed/quality

### Parameters
- **temperature**: 0.3 (focused answers)
- **max_tokens**: 1000 (response length limit)
- **content_limit**: No strict limit, but consider Groq's token limits

## 🔧 Customization

### Change Model
Edit `qaController.js`:
```javascript
model: "llama3-70b-8192", // Change this line
```

### Adjust Temperature
```javascript
temperature: 0.1, // Lower = more focused, Higher = more creative
```

### Modify System Prompt
```javascript
role: "system",
content: "Your custom system prompt here..."
```

## 🚨 Error Handling

- **401**: Invalid API key
- **429**: Rate limit exceeded
- **400**: Invalid input (missing question or content)
- **500**: Server error

## 💡 Use Cases

- Content analysis and comprehension
- Research assistance
- Document Q&A
- Learning and education
- Content verification
- Information extraction
- Fact-checking support

## 🔒 Security Notes

- Keep your API key secure
- Don't commit `.env` files to version control
- Consider rate limiting for production use
- Validate input content length

## 📊 Performance

- **Response Time**: 1-5 seconds (depending on content length)
- **Content Limit**: Flexible (consider Groq's token limits)
- **Answer Length**: Up to 1,000 tokens
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

3. **"Both question and content are required"**
   - Ensure both fields are filled
   - Check for whitespace-only inputs

4. **Server not starting**
   - Check if port 5000 is available
   - Verify all dependencies are installed

### Debug Mode
Add logging to see detailed API calls:
```javascript
console.log('Groq API Response:', response.data);
```

## 🔄 Integration with Extension

The Q&A endpoint is also integrated into the Chrome extension:

1. **New Q&A Tab**: Added to the extension navigation
2. **Question Input**: Text area for user questions
3. **Content Source**: Uses scraped page content
4. **Real-time Answers**: Instant AI-powered responses
5. **History**: Shows previous Q&A interactions

### Extension Features
- Automatic content scraping from web pages
- Question input with character limits
- Loading states and error handling
- Answer display with metadata
- Integration with existing analysis workflow

## 📝 Example Questions

Here are some example questions you can try:

- "What is the main topic of this content?"
- "What are the key benefits mentioned?"
- "What challenges or concerns are discussed?"
- "What does the content say about the future?"
- "Can you summarize the main points?"
- "What evidence supports the claims made?"
- "What are the different applications mentioned?"
- "What recommendations are provided?"
