import * as mongoose from "mongoose";
declare const Chatbot: mongoose.Model<{
    name: string;
    description: string;
    chatHistory: mongoose.Types.DocumentArray<{
        role: string;
        content: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: string;
        content: string;
    }> & {
        role: string;
        content: string;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    metadata?: any;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    description: string;
    chatHistory: mongoose.Types.DocumentArray<{
        role: string;
        content: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: string;
        content: string;
    }> & {
        role: string;
        content: string;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    metadata?: any;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    description: string;
    chatHistory: mongoose.Types.DocumentArray<{
        role: string;
        content: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    description: string;
    chatHistory: mongoose.Types.DocumentArray<{
        role: string;
        content: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: string;
        content: string;
    }> & {
        role: string;
        content: string;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    metadata?: any;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    description: string;
    chatHistory: mongoose.Types.DocumentArray<{
        role: string;
        content: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: string;
        content: string;
    }> & {
        role: string;
        content: string;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    metadata?: any;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    description: string;
    chatHistory: mongoose.Types.DocumentArray<{
        role: string;
        content: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
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
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Chatbot;
//# sourceMappingURL=Chatbot.d.ts.map