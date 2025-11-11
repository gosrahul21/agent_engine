import { Router } from "express";
import chatController from "../controllers/chatController";
import { validate } from "../validators/middleware";
import {
  chatbotIdSchema,
  chatMessageSchema,
} from "../validators/schemas";
import { validateDomain } from "../middlewares/domain-validation";

export const publicRouter = Router();

// Public endpoints for embedded chatbots (with domain validation)
publicRouter.get(
  "/chatbots/:chatbotId",
  validate(chatbotIdSchema, "params"),
  chatController.getChatbot
);

publicRouter.post(
  "/chatbots/:chatbotId/chat",
  validateDomain,
  validate(chatbotIdSchema, "params"),
  validate(chatMessageSchema, "body"),
  chatController.chat
);

publicRouter.get(
  "/chatbots/:chatbotId/history",
  validateDomain,
  validate(chatbotIdSchema, "params"),
  chatController.getChatHistory
);

