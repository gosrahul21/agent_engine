import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import Chatbot from "../modals/Chatbot";
import VectorService from "./VectorService";

/**
 * LangChain service for conversational AI
 */
export class LangChainService {
  private llm: ChatOpenAI | ChatOllama;

  constructor() {
    // Initialize LLM based on environment
    const modelType = process.env.LLM_TYPE || "openai";
    
    if (modelType === "ollama") {
      this.llm = new ChatOllama({
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: process.env.OLLAMA_MODEL || "llama2",
        temperature: 0.7,
      });
    } else {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        temperature: 0.7,
      });
    }
  }

  /**
   * Create a conversational chain with memory
   */
  private async createChain(chatbot: any, chatHistory: any[]) {
    // Convert stored chat history to LangChain messages
    const messages = chatHistory.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      } else {
        return new SystemMessage(msg.content);
      }
    });

    const memory = new BufferMemory({
      chatHistory: new ChatMessageHistory(messages),
      returnMessages: true,
      memoryKey: "chat_history",
    });

    // Create prompt template with context
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", chatbot.systemPrompt || "You are a helpful AI assistant. Use the provided context to answer questions accurately. If the context doesn't contain the answer, say so."],
      ["system", "Context:\n{context}"],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    // Create chain
    const chain = RunnableSequence.from([
      {
        input: (input: any) => input.input,
        context: (input: any) => input.context,
        chat_history: async () => {
          const history = await memory.chatHistory.getMessages();
          return history;
        },
      },
      prompt,
      this.llm,
    ]);

    return { chain, memory };
  }

  /**
   * Process a chat message with context retrieval
   */
  async chat(chatbotId: string, message: string, userId?: string) {
    try {
      // Get chatbot from database
      const chatbot = await Chatbot.findById(chatbotId);
      if (!chatbot) {
        throw new Error("Chatbot not found");
      }

      // Get chat history for this user/session
      const chatHistory = chatbot.chatHistory || [];

      // Fetch context from vector store
      let context = "";
      try {
        const vectorResults = await VectorService.queryVectors(chatbotId, message, 3);
        context = VectorService.formatContext(vectorResults);
        console.log("Retrieved context:", context.substring(0, 200) + "...");
      } catch (error) {
        console.warn("Could not fetch context from vector store:", error);
      }

      // Create chain with memory
      const { chain, memory } = await this.createChain(chatbot, chatHistory);

      // Invoke chain
      const response = await chain.invoke({
        input: message,
        context: context || "No additional context available.",
      });

      // Extract response content
      const responseContent = response.content || response.text || String(response);

      // Update chat history in database
      chatbot.chatHistory.push({
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      chatbot.chatHistory.push({
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        metadata: {
          hasContext: context.length > 0,
          contextLength: context.length,
        },
      });

      chatbot.updatedAt = new Date();
      await chatbot.save();

      return {
        response: responseContent,
        context: context.length > 0 ? context : undefined,
        chatHistory: chatbot.chatHistory,
      };
    } catch (error: any) {
      console.error("Error in LangChain chat:", error);
      throw new Error(`Chat failed: ${error.message}`);
    }
  }

  /**
   * Clear chat history for a chatbot
   */
  async clearHistory(chatbotId: string) {
    try {
      const chatbot = await Chatbot.findById(chatbotId);
      if (!chatbot) {
        throw new Error("Chatbot not found");
      }

      chatbot.chatHistory = [];
      chatbot.updatedAt = new Date();
      await chatbot.save();

      return { message: "Chat history cleared" };
    } catch (error: any) {
      throw new Error(`Failed to clear history: ${error.message}`);
    }
  }

  /**
   * Get chat history for a chatbot
   */
  async getHistory(chatbotId: string) {
    try {
      const chatbot = await Chatbot.findById(chatbotId);
      if (!chatbot) {
        throw new Error("Chatbot not found");
      }

      return chatbot.chatHistory || [];
    } catch (error: any) {
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  /**
   * Stream chat responses (for future implementation)
   */
  async streamChat(chatbotId: string, message: string) {
    // TODO: Implement streaming responses
    throw new Error("Streaming not yet implemented");
  }
}

export default new LangChainService();

