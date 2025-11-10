# JWT Public Key Setup for Chat Agent

## Problem

The auth service signs JWT tokens with RS256 (RSA public/private key algorithm), but the chat_agent needs to verify these tokens for protected chatbot routes.

## Error You're Seeing

```
JsonWebTokenError: invalid algorithm
```

This happens because:
1. Auth service signs tokens with RS256 (private key)
2. Chat agent tries to verify with wrong algorithm or missing public key

## Solution

Chat agent needs the **PUBLIC KEY** from the auth service to verify RS256 tokens.

### Step 1: Get Public Key from Auth Service

The auth service should have a key pair:
- **Private Key**: Used to SIGN tokens (kept secret on auth service)
- **Public Key**: Used to VERIFY tokens (can be shared with chat agent)

Look for these in your auth service:
```
auth-server/.env
AUTH_SECRET_KEY=<PRIVATE_KEY>
AUTH_PUBLIC_KEY=<PUBLIC_KEY>
```

Or they might be in files like:
```
auth-server/keys/private.key
auth-server/keys/public.key
```

### Step 2: Copy Public Key to Chat Agent

Add the PUBLIC key to `chat_agent/.env`:

```env
JWT_SECRET_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...YOUR PUBLIC KEY CONTENT...
-----END PUBLIC KEY-----"
```

**Important Notes:**
- Use double quotes for multiline keys
- Keep the BEGIN/END PUBLIC KEY lines
- This is ONLY the public key, NOT the private key
- The public key is safe to share (that's its purpose)

### Step 3: Format for .env File

If the key has newlines, you can format it in two ways:

**Option A: Single Line with \n**
```env
JWT_SECRET_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----"
```

**Option B: Multiline String**
```env
JWT_SECRET_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
...more lines...
-----END PUBLIC KEY-----"
```

### Step 4: Verify Configuration

After setting the public key, rebuild and restart:

```bash
cd chat_agent
npm run build
npm run dev
```

## Alternative: Use Auth Proxy Without Validation

If you don't have access to the public key, you can modify the approach:

### Option 1: Proxy Auth Validation

Instead of validating tokens in chat_agent, proxy the validation to auth service:

```typescript
// In authMiddleware, add a validation check via auth service
const validateToken = async (token: string) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  } catch {
    return null;
  }
};
```

### Option 2: Remove Auth from Chatbot Routes

Make chatbot routes public (not recommended for production):

```typescript
// In chatRouter.ts - remove authMiddleware temporarily
chatRouter.get("/all", chatController.getAllChatbots); // No auth
```

## Recommended Setup

### Auth Service Configuration

Your auth service should have:

```env
# Private key for signing (keep secret!)
AUTH_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----"

# Public key for verification (can be shared)
AUTH_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"
```

### Chat Agent Configuration

```env
# Public key only (for verifying tokens)
JWT_SECRET_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----"
```

### Frontend

No keys needed - just receives tokens from auth service.

## Testing Token Verification

### 1. Get a Token

```bash
# Login and get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUserName":"user@example.com","password":"password"}'

# Copy the accessToken from response
```

### 2. Test Chatbot Route

```bash
# Use token to access chatbot route
curl -X GET http://localhost:3000/api/chatbots/all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Expected Results

**With correct public key:**
```json
{
  "success": true,
  "data": [...]
}
```

**Without public key or wrong key:**
```
JsonWebTokenError: invalid algorithm
```

## Generating Keys (If Needed)

If you need to generate a new key pair for your auth service:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Extract public key
openssl rsa -in private.key -pubout -out public.key

# View keys
cat private.key  # Use in auth service
cat public.key   # Use in chat agent
```

## Security Notes

- ✅ **Private Key**: Only on auth service, NEVER share
- ✅ **Public Key**: Can be shared with services that verify tokens
- ✅ **RS256 Algorithm**: More secure than HS256 for distributed systems
- ✅ **Environment Variables**: Store keys in .env, not in code
- ✅ **Git Ignore**: Ensure .env is in .gitignore

## Quick Fix (For Development)

If you just want to get it working quickly:

1. **Copy the public key from your auth service**
2. **Paste into chat_agent/.env**:
   ```env
   JWT_SECRET_PUBLIC_KEY="YOUR_PUBLIC_KEY_HERE"
   ```
3. **Rebuild chat agent**:
   ```bash
   npm run build
   ```
4. **Restart**:
   ```bash
   npm run dev
   ```

## Current Issue Resolution

The error you're seeing happens because:
1. ✅ Auth proxy is working (login succeeds)
2. ❌ Chatbot routes fail because token can't be verified
3. ❌ Missing or incorrect JWT_SECRET_PUBLIC_KEY

**To fix:**
1. Get public key from auth service
2. Add to chat_agent/.env
3. Rebuild and restart chat agent

After this, both auth (proxied) and chatbot operations will work!

