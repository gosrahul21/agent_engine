"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var chatbotSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    chatHistory: {
        type: [{
                role: {
                    type: String,
                    required: true
                },
                content: {
                    type: String,
                    required: true
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
var Chatbot = mongoose.model("Chatbot", chatbotSchema);
exports.default = Chatbot;
//# sourceMappingURL=Chatbot.js.map