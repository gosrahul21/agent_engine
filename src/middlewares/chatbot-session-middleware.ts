import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { isDomainAllowed } from "./domain-validation";

export const chatbotSessionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = req.headers.authorization?.split(" ")[1];
    if(!sessionToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const decoded: any = jwt.verify(sessionToken, process.env.CHATBOT_SESSION_SECRET as string);
    if(!decoded) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    (req as any).chatbot = decoded;
    next();
}