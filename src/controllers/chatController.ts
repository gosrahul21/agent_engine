import Chatbot from "../modals/Chatbot";
import { type Request, type Response } from "express";
import ChatService from "../services/ChatService";
import LangChainService from "../services/LangChainService";
import VectorService from "../services/VectorService";

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
        const userId = (req as any).user.userId;
        const { name, description, metadata, systemPrompt } = req.body;
        const chatbot = await ChatService.createChatbot({ 
            userId,
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
        console.log((req as any).user.userId);
        const chatbots = await ChatService.getAllChatbots((req as any).user.userId as string);
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
    /**
     * Get all documents for a chatbot
     */
    async getDocuments(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            const chatbot = await Chatbot.findById(chatbotId);
            if (!chatbot) {
                return res.status(404).json({ success: false, message: "Chatbot not found" });
            }
            return res.status(200).json({
                success: true,
                data: (chatbot as any).documents || [],
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Upload document for a chatbot
     */
    async uploadDocument(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "Bad request",
                    message: "No document file provided"
                });
            }

            // Process document via RAG pipeline (chunking + Pinecone upsert)
            const result = await VectorService.uploadDocument(chatbotId as string, req.file);

            // Persist document metadata to MongoDB
            const chatbot = await Chatbot.findById(chatbotId);
            if (chatbot) {
                (chatbot as any).documents.push({
                    filename: req.file.filename,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    uploadedAt: new Date(),
                });
                await chatbot.save();
            }

            return res.status(200).json({
                success: true,
                message: "Document uploaded and processed successfully",
                data: {
                    id: req.file.filename,
                    chatbotId,
                    filename: req.file.originalname,
                    fileSize: req.file.size,
                    fileType: req.file.mimetype,
                    uploadedAt: new Date().toISOString(),
                    ragResult: result,
                }
            });
        } catch (error: any) {
            console.error("Upload document error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to upload document"
            });
        }
    }

    /**
     * Stream chat response using SSE
     */
    async streamChat(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            const { message } = req.body;

            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Bad request",
                    message: "Message is required"
                });
            }

            await LangChainService.streamChat(chatbotId as string, message.trim(), res);
        } catch (error: any) {
            console.error("Stream chat error:", error);
            // Only send error if headers not already sent
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: "Internal server error",
                    message: error.message || "Failed to stream chat"
                });
            }
        }
    }
}

export default new ChatController();
