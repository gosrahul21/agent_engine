"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
var express_1 = require("express");
var chatController_1 = require("../controllers/chatController");
var middleware_1 = require("../validators/middleware");
var schemas_1 = require("../validators/schemas");
exports.chatRouter = (0, express_1.Router)();
exports.chatRouter.get("/all", chatController_1.default.getAllChatbots);
exports.chatRouter.get("/:chatbotId", (0, middleware_1.validate)(schemas_1.chatbotIdSchema, "params"), chatController_1.default.getChatbot);
exports.chatRouter.post("/", (0, middleware_1.validate)(schemas_1.createChatbotSchema, "body"), chatController_1.default.createChatbot);
exports.chatRouter.put("/:chatbotId", (0, middleware_1.validate)(schemas_1.chatbotIdSchema, "params"), (0, middleware_1.validate)(schemas_1.updateChatbotSchema, "body"), chatController_1.default.updateChatbot);
exports.chatRouter.delete("/:chatbotId", (0, middleware_1.validate)(schemas_1.chatbotIdSchema, "params"), chatController_1.default.deleteChatbot);
//# sourceMappingURL=chatRouter.js.map