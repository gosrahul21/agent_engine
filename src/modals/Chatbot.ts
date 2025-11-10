import * as mongoose from "mongoose";

const chatbotSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    systemPrompt: {
        type: String,
        required: false,
        default: "You are a helpful AI assistant."
    },
    chatHistory: {
        type: [{
            role: {
                type: String,
                required: true,
                enum: ["user", "assistant", "system"]
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            metadata: {
                type: Object,
                required: false
            }
        }],
        default: [],
    },
    metadata: {
        type: Object,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Chatbot = mongoose.model("Chatbot", chatbotSchema);

export default Chatbot;