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
        try {
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

            // Handle document uploads (single or multiple)
            const files = (req as any).files || (req.file ? [req.file] : []);
            
            if (files.length > 0) {
                const uploadResult = await VectorService.uploadDocuments(
                    chatbot._id.toString(), 
                    files
                );

                if (uploadResult.totalFailed > 0) {
                    console.error("Some documents failed to upload:", uploadResult.failed);
                    
                    if (uploadResult.totalUploaded === 0) {
                        // All uploads failed
                        return res.status(201).json({
                            success: true,
                            data: chatbot,
                            warning: `Chatbot created but all ${uploadResult.totalFailed} document(s) failed to upload`,
                            uploadErrors: uploadResult.failed
                        });
                    }
                    
                    // Partial success
                    return res.status(201).json({
                        success: true,
                        data: chatbot,
                        documents: uploadResult.uploaded,
                        warning: `Chatbot created. ${uploadResult.totalUploaded} document(s) uploaded, ${uploadResult.totalFailed} failed`,
                        uploadErrors: uploadResult.failed
                    });
                }

                return res.status(201).json({
                    success: true,
                    data: chatbot,
                    documents: uploadResult.uploaded,
                    message: `Chatbot created with ${uploadResult.totalUploaded} document(s)`
                });
            }

            return res.status(201).json({
                success: true,
                data: chatbot
            });
        } catch (error: any) {
            console.error("Create chatbot error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to create chatbot"
            });
        }
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
        await VectorService.deleteAllDocuments(chatbotId as string);
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
     * Upload documents for a chatbot (supports single or multiple files)
     */
    async uploadDocument(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;
            
            // Handle both single file and multiple files
            const files = (req as any).files || (req.file ? [req.file] : []);

            if (files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: "Bad request",
                    message: "No file(s) provided"
                });
            }

            // Verify chatbot exists
            const chatbot = await ChatService.getChatbot(chatbotId as string);
            if (!chatbot) {
                return res.status(404).json({
                    success: false,
                    error: "Not found",
                    message: "Chatbot not found"
                });
            }

            // Upload to RAG server
            const result = await VectorService.uploadDocuments(chatbotId as string, files);

            if (result.totalFailed > 0 && result.totalUploaded === 0) {
                // All uploads failed
                return res.status(500).json({
                    success: false,
                    error: "Upload failed",
                    message: `All ${result.totalFailed} document(s) failed to upload`,
                    errors: result.failed
                });
            }

            if (result.totalFailed > 0) {
                // Partial success
                return res.status(207).json({
                    success: true,
                    data: result.uploaded,
                    message: `${result.totalUploaded} document(s) uploaded, ${result.totalFailed} failed`,
                    errors: result.failed
                });
            }

            // All uploads successful
            return res.status(200).json({
                success: true,
                data: result.uploaded,
                message: `Successfully uploaded ${result.totalUploaded} document(s)`
            });
        } catch (error: any) {
            console.error("Upload document error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to upload document(s)"
            });
        }
    }

    /**
     * Get all documents for a chatbot
     */
    async getDocuments(req: Request, res: Response) {
        try {
            const { chatbotId } = req.params;

            // Verify chatbot exists
            const chatbot = await ChatService.getChatbot(chatbotId as string);
            if (!chatbot) {
                return res.status(404).json({
                    success: false,
                    error: "Not found",
                    message: "Chatbot not found"
                });
            }

            const result = await VectorService.getDocuments(chatbotId as string);

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: "Fetch failed",
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                data: result.data
            });
        } catch (error: any) {
            console.error("Get documents error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to get documents"
            });
        }
    }

    /**
     * Delete a document from a chatbot
     */
    async deleteDocument(req: Request, res: Response) {
        try {
            const { chatbotId, documentId } = req.params;

            // Verify chatbot exists
            const chatbot = await ChatService.getChatbot(chatbotId as string);
            if (!chatbot) {
                return res.status(404).json({
                    success: false,
                    error: "Not found",
                    message: "Chatbot not found"
                });
            }

            const result = await VectorService.deleteDocument(
                chatbotId as string, 
                documentId as string
            );

            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    error: "Delete failed",
                    message: result.error
                });
            }

            return res.status(200).json({
                success: true,
                message: "Document deleted successfully",
                data: result.data
            });
        } catch (error: any) {
            console.error("Delete document error:", error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message || "Failed to delete document"
            });
        }
    }
}

export default new ChatController();
