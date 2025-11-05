# LangChain Integration Guide

## Overview

This chat agent integrates LangChain for conversational AI with context retrieval from a vector database (RAG server).

## Architecture

```
User Message
    ↓
Chat Controller
    ↓
LangChain Service ──→ Vector Service (Query RAG Server)
    ↓                        ↓
LangChain Chain          Context Retrieved
    ↓                        ↓
OpenAI/Ollama  ←─────  Context Added
    ↓
Response
    ↓
MongoDB (Save Conversation)
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/chatbot_db

# RAG Server
RAG_SERVER_URL=http://localhost:5000/api

# LLM (choose one)
LLM_TYPE=openai

# OpenAI
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-3.5-turbo

# OR Ollama
# LLM_TYPE=ollama
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=llama2
```

### 3. Start RAG Server

Make sure your Python RAG server is running:

```bash
cd ../rag_model
python app.py
```

### 4. Start Chat Agent

```bash
npm run build
npm start
```

## API Endpoints

### Create Chatbot

```bash
POST /api/chatbots
Content-Type: application/json

{
  "name": "Support Bot",
  "description": "Customer support assistant",
  "systemPrompt": "You are a helpful customer support agent."
}
```

### Send Chat Message

```bash
POST /api/chatbots/:chatbotId/chat
Content-Type: application/json

{
  "message": "How do I reset my password?",
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "To reset your password...",
    "hasContext": true,
    "context": "[Source 1: manual.pdf]\nPassword reset instructions...",
    "timestamp": "2025-01-01T12:00:00.000Z"
  }
}
```

### Get Chat History

```bash
GET /api/chatbots/:chatbotId/history
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chatbotId": "507f1f77bcf86cd799439011",
    "history": [
      {
        "role": "user",
        "content": "Hello",
        "timestamp": "2025-01-01T12:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Hi! How can I help?",
        "timestamp": "2025-01-01T12:00:01.000Z",
        "metadata": {
          "hasContext": true,
          "contextLength": 500
        }
      }
    ],
    "totalMessages": 2
  }
}
```

### Clear Chat History

```bash
DELETE /api/chatbots/:chatbotId/history
```

## How It Works

### 1. Message Flow

1. User sends a message to `/api/chatbots/:chatbotId/chat`
2. **LangChainService** receives the message
3. **VectorService** queries the RAG server for relevant context
4. Context is formatted and added to the conversation
5. LangChain chain processes the message with context
6. LLM (OpenAI/Ollama) generates response
7. Conversation is saved to MongoDB

### 2. Context Retrieval

```typescript
// VectorService queries RAG server
const results = await axios.post(
  'http://localhost:5000/api/chatbots/123/vectors/query',
  { query: "user message", topK: 3 }
);

// Format context
const context = results.map(r => 
  `[Source: ${r.metadata.source}]\n${r.content}`
).join('\n\n');
```

### 3. LangChain Processing

```typescript
// Create prompt with context
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant..."],
  ["system", "Context:\n{context}"],
  MessagesPlaceholder("chat_history"),
  ["human", "{input}"]
]);

// Create chain
const chain = RunnableSequence.from([prompt, llm]);

// Invoke
const response = await chain.invoke({
  input: message,
  context: retrievedContext
});
```

### 4. Conversation Storage

```typescript
// Save to MongoDB
chatbot.chatHistory.push({
  role: "user",
  content: message,
  timestamp: new Date()
});

chatbot.chatHistory.push({
  role: "assistant",
  content: response,
  timestamp: new Date(),
  metadata: { hasContext: true }
});

await chatbot.save();
```

## Testing

### Test with cURL

```bash
# 1. Create chatbot
curl -X POST http://localhost:3000/api/chatbots \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Bot",
    "description": "Testing bot",
    "systemPrompt": "You are a helpful assistant."
  }'

# Response: { "success": true, "data": { "_id": "...", ... } }

# 2. Send message (use the _id from step 1)
curl -X POST http://localhost:3000/api/chatbots/YOUR_CHATBOT_ID/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the main features?",
    "userId": "user123"
  }'

# 3. Get history
curl http://localhost:3000/api/chatbots/YOUR_CHATBOT_ID/history
```

### Test with Postman

Import these requests:

**1. Create Chatbot**
- POST `http://localhost:3000/api/chatbots`
- Body (JSON):
  ```json
  {
    "name": "My Bot",
    "description": "Test bot",
    "systemPrompt": "You are helpful."
  }
  ```

**2. Chat**
- POST `http://localhost:3000/api/chatbots/:chatbotId/chat`
- Body (JSON):
  ```json
  {
    "message": "Hello!",
    "userId": "user1"
  }
  ```

## Features

✅ **LangChain Integration** - Conversational AI with memory  
✅ **Context Retrieval** - Fetches relevant docs from RAG server  
✅ **Conversation History** - Stored in MongoDB  
✅ **Multiple LLMs** - Supports OpenAI and Ollama  
✅ **Validation** - Zod schema validation  
✅ **Error Handling** - Comprehensive error handling  

## Troubleshooting

### "Cannot connect to RAG server"
- Ensure Python RAG server is running on port 5000
- Check `RAG_SERVER_URL` in `.env`

### "OpenAI API key invalid"
- Verify `OPENAI_API_KEY` in `.env`
- Check OpenAI account status

### "Chatbot not found"
- Ensure chatbot ID is valid MongoDB ObjectId
- Check MongoDB connection

### "No context retrieved"
- Ensure vectors are created for chatbot in RAG server
- Check RAG server logs

## Next Steps

- [ ] Add streaming responses
- [ ] Implement conversation sessions
- [ ] Add user authentication
- [ ] Support multiple conversations per chatbot
- [ ] Add analytics and metrics
- [ ] Implement rate limiting
- [ ] Add webhook notifications

