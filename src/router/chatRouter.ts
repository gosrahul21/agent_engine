import { Router } from "express";
import chatController from "../controllers/chatController";
import { validate } from "../validators/middleware";
import { 
  createChatbotSchema, 
  updateChatbotSchema, 
  chatbotIdSchema,
  chatMessageSchema
} from "../validators/schemas";
import { authMiddleware } from "../middlewares/auth-middlewares";
import upload from "../middlewares/upload";

export const chatRouter = Router();

// Chatbot CRUD
chatRouter.get("/all", authMiddleware, chatController.getAllChatbots);
chatRouter.get("/:chatbotId", validate(chatbotIdSchema, "params"), chatController.getChatbot);
chatRouter.post(
  "/", 
  authMiddleware, 
  upload.array('documents', 10), // Optional multiple document upload during creation (max 10 files)
  validate(createChatbotSchema, "body"), 
  chatController.createChatbot
);
chatRouter.put("/:chatbotId", authMiddleware, validate(chatbotIdSchema, "params"), validate(updateChatbotSchema, "body"), chatController.updateChatbot);
chatRouter.delete("/:chatbotId", authMiddleware, validate(chatbotIdSchema, "params"), chatController.deleteChatbot);

// Document management
chatRouter.post(
  "/:chatbotId/documents", 
  authMiddleware, 
  validate(chatbotIdSchema, "params"), 
  upload.array('documents', 10), // Upload multiple documents (max 10 files)
  chatController.uploadDocument
);
chatRouter.get("/:chatbotId/documents", authMiddleware, validate(chatbotIdSchema, "params"), chatController.getDocuments);
chatRouter.delete("/:chatbotId/documents/:documentId", authMiddleware, validate(chatbotIdSchema, "params"), chatController.deleteDocument);

// Chat operations with LangChain
chatRouter.post("/:chatbotId/chat", authMiddleware, validate(chatbotIdSchema, "params"), validate(chatMessageSchema, "body"), chatController.chat);
chatRouter.get("/:chatbotId/history", authMiddleware, validate(chatbotIdSchema, "params"), chatController.getChatHistory);
chatRouter.delete("/:chatbotId/history", authMiddleware, validate(chatbotIdSchema, "params"), chatController.clearChatHistory);

