import { z } from "zod";

/**
 * Validation schemas for chatbot operations
 */

// Chatbot ID validation
export const chatbotIdSchema = z.object({
  chatbotId: z.string().min(1, "Chatbot ID is required").regex(/^[a-fA-F0-9]{24}$/, "Invalid chatbot ID format")
});

// Create chatbot validation
export const createChatbotSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters")
    .trim(),
  systemPrompt: z.string()
    .max(1000, "System prompt must be less than 1000 characters")
    .trim()
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  allowedDomains: z.array(z.string().min(1, "Domain cannot be empty")).optional(),
  isEmbeddable: z.boolean().optional()
});

// Update chatbot validation
export const updateChatbotSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters")
    .trim()
    .optional(),
  systemPrompt: z.string()
    .max(1000, "System prompt must be less than 1000 characters")
    .trim()
    .optional(),
  metadata: z.record(z.unknown()).optional(),
  allowedDomains: z.array(z.string().min(1, "Domain cannot be empty")).optional(),
  isEmbeddable: z.boolean().optional()
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, "Message is required")
    .max(5000, "Message must be less than 5000 characters")
    .trim(),
  userId: z.string().optional(),
  stream: z.boolean().optional().default(false)
});

// Document upload validation
export const uploadDocumentSchema = z.object({
  filename: z.string()
    .min(1, "Filename is required")
    .regex(/\.(pdf|txt|md|doc|docx|csv|json)$/i, "Invalid file type"),
  fileSize: z.number()
    .int()
    .positive()
    .max(16 * 1024 * 1024, "File size must be less than 16MB")
});

// Vector query validation
export const vectorQuerySchema = z.object({
  query: z.string()
    .min(1, "Query is required")
    .max(1000, "Query must be less than 1000 characters")
    .trim(),
  topK: z.number()
    .int()
    .min(1, "topK must be at least 1")
    .max(20, "topK must be at most 20")
    .optional()
    .default(5),
  filter: z.record(z.unknown()).optional()
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, "Page must be a number")
    .transform(Number)
    .refine((n) => n >= 1, "Page must be at least 1")
    .optional()
    .default("1"),
  limit: z.string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .refine((n) => n >= 1 && n <= 100, "Limit must be between 1 and 100")
    .optional()
    .default("10")
});

// Conversation validation
export const createConversationSchema = z.object({
  chatbotId: z.string().min(1, "Chatbot ID is required"),
  userId: z.string().optional(),
  title: z.string().max(200, "Title must be less than 200 characters").optional(),
  metadata: z.record(z.unknown()).optional()
});

// Export types
export type ChatbotIdInput = z.infer<typeof chatbotIdSchema>;
export type CreateChatbotInput = z.infer<typeof createChatbotSchema>;
export type UpdateChatbotInput = z.infer<typeof updateChatbotSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type VectorQueryInput = z.infer<typeof vectorQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
