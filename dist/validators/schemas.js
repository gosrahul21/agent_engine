"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConversationSchema = exports.paginationSchema = exports.vectorQuerySchema = exports.uploadDocumentSchema = exports.chatMessageSchema = exports.updateChatbotSchema = exports.createChatbotSchema = exports.chatbotIdSchema = void 0;
var zod_1 = require("zod");
/**
 * Validation schemas for chatbot operations
 */
// Chatbot ID validation
exports.chatbotIdSchema = zod_1.z.object({
    chatbotId: zod_1.z.string().min(1, "Chatbot ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid chatbot ID format")
});
// Create chatbot validation
exports.createChatbotSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .trim(),
    description: zod_1.z.string()
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters")
        .trim(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional()
});
// Update chatbot validation
exports.updateChatbotSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .trim()
        .optional(),
    description: zod_1.z.string()
        .min(1, "Description is required")
        .max(500, "Description must be less than 500 characters")
        .trim()
        .optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional()
}).refine(function (data) { return Object.keys(data).length > 0; }, {
    message: "At least one field must be provided for update"
});
// Chat message validation
exports.chatMessageSchema = zod_1.z.object({
    message: zod_1.z.string()
        .min(1, "Message is required")
        .max(5000, "Message must be less than 5000 characters")
        .trim(),
    conversationId: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    stream: zod_1.z.boolean().optional().default(false),
    context: zod_1.z.object({
        enabled: zod_1.z.boolean().default(true),
        topK: zod_1.z.number().int().min(1).max(10).optional().default(5),
        similarityThreshold: zod_1.z.number().min(0).max(1).optional()
    }).optional()
});
// Document upload validation
exports.uploadDocumentSchema = zod_1.z.object({
    filename: zod_1.z.string()
        .min(1, "Filename is required")
        .regex(/\.(pdf|txt|md|doc|docx|csv|json)$/i, "Invalid file type"),
    fileSize: zod_1.z.number()
        .int()
        .positive()
        .max(16 * 1024 * 1024, "File size must be less than 16MB")
});
// Vector query validation
exports.vectorQuerySchema = zod_1.z.object({
    query: zod_1.z.string()
        .min(1, "Query is required")
        .max(1000, "Query must be less than 1000 characters")
        .trim(),
    topK: zod_1.z.number()
        .int()
        .min(1, "topK must be at least 1")
        .max(20, "topK must be at most 20")
        .optional()
        .default(5),
    filter: zod_1.z.record(zod_1.z.unknown()).optional()
});
// Pagination validation
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string()
        .regex(/^\d+$/, "Page must be a number")
        .transform(Number)
        .refine(function (n) { return n >= 1; }, "Page must be at least 1")
        .optional()
        .default("1"),
    limit: zod_1.z.string()
        .regex(/^\d+$/, "Limit must be a number")
        .transform(Number)
        .refine(function (n) { return n >= 1 && n <= 100; }, "Limit must be between 1 and 100")
        .optional()
        .default("10")
});
// Conversation validation
exports.createConversationSchema = zod_1.z.object({
    chatbotId: zod_1.z.string().min(1, "Chatbot ID is required"),
    userId: zod_1.z.string().optional(),
    title: zod_1.z.string().max(200, "Title must be less than 200 characters").optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional()
});
//# sourceMappingURL=schemas.js.map