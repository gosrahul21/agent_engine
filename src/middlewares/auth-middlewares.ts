import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
        // Get the public key for RS256 verification
        const publicKey = process.env.JWT_SECRET_PUBLIC_KEY as string;
        
        if (!publicKey) {
            console.error('JWT_SECRET_PUBLIC_KEY not configured');
            return res.status(500).json({ message: 'Server configuration error' });
        }
        
        // Verify with RS256 algorithm (matching auth service)
        const decoded = jwt.verify(token, publicKey, { 
            algorithms: ['RS256'] 
        });
        
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        (req as any).user = decoded as { userId: string, email: string, userName: string };
        next();
    } catch (error: any) {
        console.error('JWT verification error:', error.message);
        return res.status(401).json({ 
            message: 'Unauthorized', 
            error: error.message 
        });
    }
}