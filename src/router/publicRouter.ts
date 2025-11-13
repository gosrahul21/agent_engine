import { Router } from "express";
import chatController from "../controllers/chatController";
import { validate } from "../validators/middleware";
import {
  chatbotIdSchema,
  chatMessageSchema,
} from "../validators/schemas";
import { validateDomain } from "../middlewares/domain-validation";
import { chatbotSessionMiddleware } from "../middlewares/chatbot-session-middleware";

export const publicRouter = Router();

// Public endpoints for embedded chatbots (with domain validation)
publicRouter.get(
  "/chatbots",
  chatbotSessionMiddleware,
  chatController.getChatbot
);

publicRouter.get(
  "/chatbots/generate-session/:embedKey",
  // validateDomain,
  chatController.getChatbotSession
);

publicRouter.post(
  "/chatbots/chat",
  chatbotSessionMiddleware,
  validate(chatMessageSchema, "body"),
  chatController.chat
);

publicRouter.get(
  "/chatbots/history",
  chatbotSessionMiddleware,
  chatController.getChatHistory
);

