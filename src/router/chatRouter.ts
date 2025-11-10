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

export const chatRouter = Router();

// Chatbot CRUD
chatRouter.get("/all", authMiddleware, chatController.getAllChatbots);
chatRouter.get("/:chatbotId",validate(chatbotIdSchema, "params"),  chatController.getChatbot);
chatRouter.post("/",authMiddleware, validate(createChatbotSchema, "body"), chatController.createChatbot);
chatRouter.put("/:chatbotId", authMiddleware, validate(chatbotIdSchema, "params"), validate(updateChatbotSchema, "body"), chatController.updateChatbot);
chatRouter.delete("/:chatbotId", authMiddleware, validate(chatbotIdSchema, "params"), chatController.deleteChatbot);

// Chat operations with LangChain
chatRouter.post("/:chatbotId/chat", authMiddleware, validate(chatbotIdSchema, "params"), validate(chatMessageSchema, "body"), chatController.chat);
chatRouter.get("/:chatbotId/history", authMiddleware, validate(chatbotIdSchema, "params"), chatController.getChatHistory);
chatRouter.delete("/:chatbotId/history", authMiddleware, validate(chatbotIdSchema, "params"), chatController.clearChatHistory);

