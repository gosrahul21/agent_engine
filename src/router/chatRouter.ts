import { Router } from "express";
import chatController from "../controllers/chatController";
import { validate } from "../validators/middleware";
import { 
  createChatbotSchema, 
  updateChatbotSchema, 
  chatbotIdSchema,
  chatMessageSchema
} from "../validators/schemas";

export const chatRouter = Router();

// Chatbot CRUD
chatRouter.get("/all", chatController.getAllChatbots);
chatRouter.get("/:chatbotId",validate(chatbotIdSchema, "params"),  chatController.getChatbot);
chatRouter.post("/", validate(createChatbotSchema, "body"), chatController.createChatbot);
chatRouter.put("/:chatbotId", validate(chatbotIdSchema, "params"), validate(updateChatbotSchema, "body"), chatController.updateChatbot);
chatRouter.delete("/:chatbotId", validate(chatbotIdSchema, "params"), chatController.deleteChatbot);

// Chat operations with LangChain
chatRouter.post("/:chatbotId/chat", validate(chatbotIdSchema, "params"), validate(chatMessageSchema, "body"), chatController.chat);
chatRouter.get("/:chatbotId/history", validate(chatbotIdSchema, "params"), chatController.getChatHistory);
chatRouter.delete("/:chatbotId/history", validate(chatbotIdSchema, "params"), chatController.clearChatHistory);

