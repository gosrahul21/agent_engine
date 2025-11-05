import { z } from "zod";
/**
 * Validation schemas for chatbot operations
 */
export declare const chatbotIdSchema: z.ZodObject<{
    chatbotId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    chatbotId: string;
}, {
    chatbotId: string;
}>;
export declare const createChatbotSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    metadata?: Record<string, unknown> | undefined;
}, {
    name: string;
    description: string;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const updateChatbotSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export declare const chatMessageSchema: z.ZodObject<{
    message: z.ZodString;
    conversationId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    context: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        similarityThreshold: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        topK: number;
        similarityThreshold?: number | undefined;
    }, {
        enabled?: boolean | undefined;
        topK?: number | undefined;
        similarityThreshold?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    stream: boolean;
    context?: {
        enabled: boolean;
        topK: number;
        similarityThreshold?: number | undefined;
    } | undefined;
    conversationId?: string | undefined;
    userId?: string | undefined;
}, {
    message: string;
    context?: {
        enabled?: boolean | undefined;
        topK?: number | undefined;
        similarityThreshold?: number | undefined;
    } | undefined;
    conversationId?: string | undefined;
    userId?: string | undefined;
    stream?: boolean | undefined;
}>;
export declare const uploadDocumentSchema: z.ZodObject<{
    filename: z.ZodString;
    fileSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    filename: string;
    fileSize: number;
}, {
    filename: string;
    fileSize: number;
}>;
export declare const vectorQuerySchema: z.ZodObject<{
    query: z.ZodString;
    topK: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    query: string;
    topK: number;
    filter?: Record<string, unknown> | undefined;
}, {
    query: string;
    filter?: Record<string, unknown> | undefined;
    topK?: number | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    limit?: string | undefined;
    page?: string | undefined;
}>;
export declare const createConversationSchema: z.ZodObject<{
    chatbotId: z.ZodString;
    userId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    chatbotId: string;
    metadata?: Record<string, unknown> | undefined;
    userId?: string | undefined;
    title?: string | undefined;
}, {
    chatbotId: string;
    metadata?: Record<string, unknown> | undefined;
    userId?: string | undefined;
    title?: string | undefined;
}>;
export type ChatbotIdInput = z.infer<typeof chatbotIdSchema>;
export type CreateChatbotInput = z.infer<typeof createChatbotSchema>;
export type UpdateChatbotInput = z.infer<typeof updateChatbotSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type VectorQueryInput = z.infer<typeof vectorQuerySchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
//# sourceMappingURL=schemas.d.ts.map