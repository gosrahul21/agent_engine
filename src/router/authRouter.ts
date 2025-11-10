import { Router, Request, Response } from "express";
import axios from "axios";

export const authRouter = Router();

// Auth service URL - forwarding to the actual auth service
// IMPORTANT: This should NOT be port 3000 (that's this service!)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:8000";

/**
 * Proxy middleware to forward all auth requests to the auth service
 */
const proxyToAuthService = async (req: Request, res: Response) => {
  try {
    // Build the target URL
    const targetUrl = `${AUTH_SERVICE_URL}${req.originalUrl}`;
    
    // Forward headers (especially Authorization and refresh-token)
    const headers: any = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };
    
    // Forward authentication headers if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (req.headers['x-access-token']) {
      headers['x-access-token'] = req.headers['x-access-token'];
    }
    if (req.headers['refresh-token']) {
      headers['refresh-token'] = req.headers['refresh-token'];
    }

    // Make the request to auth service
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: headers,
      params: req.query,
      validateStatus: () => true, // Don't throw on any status code
    });

    // Forward the response status and data
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Auth proxy error:', error.message);
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Authentication service is not available',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to process authentication request',
    });
  }
};

// Auth routes - all proxied to auth service
authRouter.post('/signup', proxyToAuthService);
authRouter.post('/login', proxyToAuthService);
authRouter.get('/', proxyToAuthService);
authRouter.post('/approve', proxyToAuthService);
authRouter.get('/all', proxyToAuthService);
authRouter.get('/refreshSession', proxyToAuthService);
authRouter.get('/:userId', proxyToAuthService);

// Google OAuth routes
authRouter.get('/google/login', proxyToAuthService);
authRouter.get('/google/callback', proxyToAuthService);
authRouter.post('/google/token', proxyToAuthService);

