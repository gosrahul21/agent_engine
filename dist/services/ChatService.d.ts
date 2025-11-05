declare class ChatService {
    getChatbot(chatbotId: string): Promise<(import("mongoose").FlattenMaps<{
        name: string;
        description: string;
        chatHistory: import("mongoose").Types.DocumentArray<{
            role: string;
            content: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            role: string;
            content: string;
        }> & {
            role: string;
            content: string;
        }>;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        metadata?: any;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    createChatbot(data: {
        name: string;
        description: string;
        metadata?: Record<string, any>;
    }): Promise<import("mongoose").Document<unknown, {}, {
        name: string;
        description: string;
        chatHistory: import("mongoose").Types.DocumentArray<{
            role: string;
            content: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            role: string;
            content: string;
        }> & {
            role: string;
            content: string;
        }>;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        metadata?: any;
    }, {}, import("mongoose").DefaultSchemaOptions> & {
        name: string;
        description: string;
        chatHistory: import("mongoose").Types.DocumentArray<{
            role: string;
            content: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            role: string;
            content: string;
        }> & {
            role: string;
            content: string;
        }>;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        metadata?: any;
    } & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getAllChatbots(): Promise<(import("mongoose").FlattenMaps<{
        name: string;
        description: string;
        chatHistory: import("mongoose").Types.DocumentArray<{
            role: string;
            content: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            role: string;
            content: string;
        }> & {
            role: string;
            content: string;
        }>;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        metadata?: any;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[] | {
        success: boolean;
        error: string;
        message: string;
    }>;
    updateChatbot(chatbotId: string, data: {
        name?: string;
        description?: string;
        metadata?: Record<string, any>;
    }): Promise<(import("mongoose").FlattenMaps<{
        name: string;
        description: string;
        chatHistory: import("mongoose").Types.DocumentArray<{
            role: string;
            content: string;
        }, import("mongoose").Types.Subdocument<import("bson").ObjectId, any, {
            role: string;
            content: string;
        }> & {
            role: string;
            content: string;
        }>;
        createdAt: NativeDate;
        updatedAt: NativeDate;
        metadata?: any;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    deleteChatbot(chatbotId: string): Promise<{
        message: string;
    }>;
}
declare const _default: ChatService;
export default _default;
//# sourceMappingURL=ChatService.d.ts.map