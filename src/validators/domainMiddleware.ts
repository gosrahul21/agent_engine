import { NextFunction, Request, Response } from "express";
import ChatService from "../services/ChatService";

export const validateDomain = async (req: Request, res: Response, next: NextFunction) => {
    const domain = req.headers.origin;
    const chatbot = await ChatService.getChatbot(req.params.chatbotId as string);
    if (!domain) {
        return res.status(400).json({
            success: false,
            error: "Domain is required",
            message: "Domain is required"
        });
    }
    if (!chatbot) {
        return res.status(404).json({
            success: false,
            error: "Chatbot not found",
            message: "Chatbot not found"
        });
    }
    if(!chatbot.isEmbeddable) {
        return res.status(403).json({
            success: false,
            error: "Chatbot is not embeddable",
            message: "Chatbot is not embeddable"
        });
    }
    if (!chatbot.allowedDomains?.includes(domain)) {
        return res.status(403).json({
            success: false,
            error: "Domain not allowed",
            message: "Domain not allowed"
        });
    }
    next();
};