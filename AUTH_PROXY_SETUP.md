# Authentication Proxy Setup

The chat_agent service now acts as a proxy for authentication requests, forwarding them to the auth service on port 8000.

## Architecture

```
┌─────────────┐
│  Chat-UI    │  (Port 5173)
└──────┬──────┘
       │
       │ All requests go to port 3000
       │
       ▼
┌─────────────────────────────────────┐
│      Chat Agent Service             │
│         (Port 3000)                 │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   Chatbot    │  │    Auth     │ │
│  │   Routes     │  │   Proxy     │ │
│  │ /api/chatbots│  │   /auth     │ │
│  └──────┬───────┘  └──────┬──────┘ │
└─────────┼──────────────────┼────────┘
          │                  │
          │                  │ Forwards to
          │                  ▼
          │         ┌─────────────────┐
          │         │  Auth Service   │
          │         │  (Port 8000)    │
          │         └─────────────────┘
          │
          ▼
    ┌─────────┐
    │ MongoDB │
    └─────────┘
```

## How It Works

### Before (Direct Connection)
```
Chat-UI → Auth Service (Port 8000)
        ↘ Chat Agent (Port 3000)
```

### After (Proxied Connection)
```
Chat-UI → Chat Agent (Port 3000) → Auth Service (Port 8000)
         ↘ (Also handles chatbot routes)
```

## Configuration

### 1. Chat Agent (.env)

Create `.env` file in `chat_agent/`:

```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:8000
MONGODB_URI=mongodb://localhost:27017/chatbot
```

### 2. Chat-UI (.env)

Update `.env` file in `chat-ui/`:

```env
# Both auth and chatbot requests go to port 3000
VITE_AUTH_API_URL=http://localhost:3000
VITE_CHATBOT_API_URL=http://localhost:3000
VITE_RAG_API_URL=http://localhost:5000
```

## Routes Proxied

All routes under `/auth` are forwarded to the auth service:

### Authentication Routes
- `POST /auth/signup` → Forwarded to `http://localhost:8000/auth/signup`
- `POST /auth/login` → Forwarded to `http://localhost:8000/auth/login`
- `GET /auth/` → Forwarded to `http://localhost:8000/auth/`
- `GET /auth/refreshSession` → Forwarded to `http://localhost:8000/auth/refreshSession`
- `GET /auth/:userId` → Forwarded to `http://localhost:8000/auth/:userId`

### Google OAuth Routes
- `GET /auth/google/login` → Forwarded to `http://localhost:8000/auth/google/login`
- `GET /auth/google/callback` → Forwarded to `http://localhost:8000/auth/google/callback`
- `POST /auth/google/token` → Forwarded to `http://localhost:8000/auth/google/token`

## Headers Forwarded

The proxy automatically forwards these headers:
- `Authorization` - Bearer token
- `x-access-token` - Alternative auth header
- `refresh-token` - Refresh token for session renewal
- `Content-Type` - Request content type

## Starting Services

### 1. Start Auth Service (Port 8000)
```bash
cd auth-server
# Update .env to use PORT=8000
npm run start:dev
```

### 2. Start Chat Agent with Proxy (Port 3000)
```bash
cd chat_agent
npm run build
npm run dev
```

### 3. Start RAG Service (Port 5000)
```bash
cd rag_model
source venv/bin/activate
python app.py
```

### 4. Start Frontend (Port 5173)
```bash
cd chat-ui
npm run dev
```

## Benefits

### 1. Single Entry Point
- Frontend only needs to know about one backend URL (port 3000)
- Easier to manage in production with API gateway

### 2. Simplified CORS
- Only need to configure CORS on chat_agent
- Auth service can be internal-only

### 3. Load Balancing Ready
- Easy to add load balancing at chat_agent level
- Can route to multiple auth service instances

### 4. Better Security
- Auth service doesn't need to be publicly accessible
- Can be behind firewall, only chat_agent connects to it

### 5. Request Logging
- All requests go through chat_agent
- Centralized logging and monitoring

## Error Handling

### Service Unavailable (503)
If auth service is down:
```json
{
  "success": false,
  "error": "Service Unavailable",
  "message": "Authentication service is not available"
}
```

### Internal Server Error (500)
If proxy encounters an error:
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to process authentication request"
}
```

## Testing

### Test Auth Proxy

```bash
# Test signup through proxy
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "testuser",
    "password": "password123"
  }'

# Test login through proxy
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUserName": "test@example.com",
    "password": "password123"
  }'

# Test token verification through proxy
curl -X GET http://localhost:3000/auth/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Debugging

### Check Proxy Logs
The chat_agent console will show proxy activity:
```
Auth proxy: POST /auth/login → http://localhost:8000/auth/login
Auth proxy: GET /auth/ → http://localhost:8000/auth/
```

### Verify Auth Service Connection
```bash
# Direct auth service test
curl http://localhost:8000/health

# Through proxy
curl http://localhost:3000/auth/health
```

## Production Deployment

### Environment Variables

**Chat Agent:**
```env
PORT=3000
AUTH_SERVICE_URL=https://auth.yourdomain.com
MONGODB_URI=mongodb://prod-db/chatbot
```

**Frontend:**
```env
VITE_AUTH_API_URL=https://api.yourdomain.com
VITE_CHATBOT_API_URL=https://api.yourdomain.com
VITE_RAG_API_URL=https://rag.yourdomain.com
```

### Benefits in Production

1. **Single SSL Certificate**: Only chat_agent needs public SSL
2. **Internal Auth Service**: Auth service can be private
3. **API Gateway**: Chat agent acts as gateway
4. **Rate Limiting**: Apply at chat_agent level
5. **Monitoring**: Centralized at chat_agent

## Troubleshooting

### "Authentication service is not available"
- Check if auth service is running on port 8000
- Verify `AUTH_SERVICE_URL` in chat_agent `.env`
- Check network connectivity

### "CORS error"
- Verify chat_agent CORS is configured for frontend URL
- Check that requests go to port 3000, not 8000

### "Token not forwarded"
- Check that `Authorization` header is present
- Verify proxy is forwarding headers correctly
- Check browser Network tab

### "404 Not Found"
- Verify route exists in auth service
- Check that route is registered in authRouter.ts
- Verify path matches exactly

## Migration Guide

If you were using direct connection before:

### 1. Update Auth Service Port
Change auth service to run on port 8000:
```env
# auth-server/.env
PORT=8000
```

### 2. Update Chat-UI Config
```env
# chat-ui/.env
VITE_AUTH_API_URL=http://localhost:3000  # Changed from 8000
```

### 3. Rebuild Chat Agent
```bash
cd chat_agent
npm run build
```

### 4. Restart Services
Restart in order:
1. Auth service (port 8000)
2. Chat agent (port 3000)
3. Frontend (port 5173)

### 5. Test
- Login should work through proxy
- Check browser Network tab shows requests to port 3000
- Verify backend logs show proxy forwarding

## Summary

✅ All auth requests from chat-ui now go to chat_agent (port 3000)
✅ Chat_agent proxies them to auth service (port 8000)
✅ Headers and tokens are properly forwarded
✅ Error handling for service unavailability
✅ Simplified frontend configuration
✅ Production-ready architecture

