import Chatbot from "../modals/Chatbot";
import { type Request, type Response } from "express";
import ChatService from "../services/ChatService";
import LangChainService from "../services/LangChainService";

class ChatController {
    async getChatbot(req: Request, res: Response) {
        // Validation is handled by middleware
        const { chatbotId } = req.params;
        const chatbot = await ChatService.getChatbot(chatbotId as string);
        if (!chatbot) {
            return res.status(404).json({ 
                success: false,
                error: "Not found",
                message: "Chatbot not found" 
            });
        }
        return res.status(200).json({
            success: true,
            data: chatbot
        });
    }

    async createChatbot(req: Request, res: Response) {
        // Validation is handled by middleware
        const { name, description, metadata, systemPrompt } = req.body;
        const chatbot = await ChatService.createChatbot({ 
            name, 
            description, 
            metadata,
            systemPrompt 
        });
        return res.status(201).json({
            success: true,
            data: chatbot
        });
    }

    async updateChatbot(req: Request, res: Response) {
        // Validation is handled by middleware
        const { chatbotId } = req.params;
        const updateData = req.body;
        const chatbot = await ChatService.updateChatbot(chatbotId as string, updateData);
        if (!chatbot) {
            return res.status(404).json({ 
                success: false,
                error: "Not found",
                message: "Chatbot not found" 
            });
        }
        return res.status(200).json({
            success: true,
            data: chatbot
        });
    }
    
    async deleteChatbot(req: Request, res: Response) {
        // Validation is handled by middleware
        const { chatbotId } = req.params;
        const chatbot = await ChatService.deleteChatbot(chatbotId as string);
        if (!chatbot) {
            return res.status(404).json({ 
                success: false,
                error: "Not found",
                message: "Chatbot not found" 
            });
        }
        return res.status(200).json({ 
            success: true,
            message: "Chatbot deleted successfully" 
        });
    }
    async getAllChatbots(req: Request, res: Response) {
        console.log((req as any).user.id);
        const chatbots = await ChatService.getAllChatbots((req as any).user.id as string);
        return res.status(200).json({
            success: true,
            data: chatbots
        });
    }

    /**
     * Send a chat message with LangChain and vector context
     */
    async chat(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            const { message, userId } = req.body;

            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Bad request",
                    message: "Message is required"
                });
            }

            // Process chat with LangChain
            const result = await LangChainService.chat(
                chatbotId as string, 
                message.trim(),
                userId
            );

            return res.status(200).json({
                success: true,
                data: {
                    response: result.response,
                    hasContext: !!result.context,
                    context: result.context,
                    timestamp: new Date()
                }
            });
        } catch (error: any) {
            console.error("Chat error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to process chat message"
            });
        }
    }

    /**
     * Get chat history for a chatbot
     */
    async getChatHistory(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            
            const history = await LangChainService.getHistory(chatbotId as string);

            return res.status(200).json({
                success: true,
                data: {
                    chatbotId,
                    history,
                    totalMessages: history.length
                }
            });
        } catch (error: any) {
            console.error("Get history error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to get chat history"
            });
        }
    }

    /**
     * Clear chat history for a chatbot
     */
    async clearChatHistory(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            
            await LangChainService.clearHistory(chatbotId as string);

            return res.status(200).json({
                success: true,
                message: "Chat history cleared successfully"
            });
        } catch (error: any) {
            console.error("Clear history error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to clear chat history"
            });
        }
    }
}

export default new ChatController();
