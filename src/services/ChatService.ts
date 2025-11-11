import Chatbot from "../modals/Chatbot";

class ChatService {
    async getChatbot(chatbotId: string) {
        const chatbot = await Chatbot.findById(chatbotId).lean();
        return chatbot;
    }

    async createChatbot(data: { userId: string, name: string, description: string, metadata?: Record<string, any>, systemPrompt?: string, files?: File[] }) {
        console.log("data", data);
        const chatbot = await Chatbot.create(data);
        return chatbot;
    }

    async getAllChatbots(userId: string) {
        try {
            const chatbots = await Chatbot.find({ userId: userId }).lean();
            return chatbots;
        } catch (error) {
            console.error(error);
            return {
                success: false,
                error: "Failed to get all chatbots",
                message: "Failed to get all chatbots"
            };
        }
    }

    async updateChatbot(chatbotId: string, data: { name?: string, description?: string, metadata?: Record<string, any> }) {
        const chatbot = await Chatbot.findByIdAndUpdate(chatbotId, data, { new: true }).lean();
        return chatbot;
    }

    async deleteChatbot(chatbotId: string) {
        await Chatbot.findByIdAndDelete(chatbotId);
        return { message: "Chatbot deleted successfully" };
    }

    async uploadDocument(chatbotId: string, document: { name: string, url: string }) {
        const chatbot = await Chatbot.findByIdAndUpdate(chatbotId, { $push: { documents: document } }, { new: true }).lean();
        return chatbot;
    }

    async queryChatbot(chatbotId: string, query: string) {
        const chatbot = await Chatbot.findByIdAndUpdate(chatbotId, { $push: { queries: query } }, { new: true }).lean();
        return chatbot;
    }
    async addDomain(chatbotId: string, domain: string) {
        const chatbot = await Chatbot.findByIdAndUpdate(chatbotId, { $push: { domain: domain } }, { new: true }).lean();
        return chatbot;
    }
    async removeDomain(chatbotId: string, domain: string) {
        const chatbot = await Chatbot.findByIdAndUpdate(chatbotId, { $pull: { domain: domain } }, { new: true }).lean();
        return chatbot;
    }
}

export default new ChatService();