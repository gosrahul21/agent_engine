import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import Chatbot from "../modals/Chatbot";
import VectorService from "./VectorService";

/**
 * LangChain service for conversational AI
 */
export class LangChainService {
  private llm: any;

  constructor() {
    // Initialize LLM based on environment
    const modelType = process.env.LLM_TYPE || "gemini";
    
    if (modelType === "ollama") {
      this.llm = new ChatOllama({
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        model: process.env.OLLAMA_MODEL || "llama2",
        temperature: 0.7,
      });
    } 
    else if (modelType === "gemini") {
      this.llm = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY || "AIzaSyDr9eCQ882dW9F5F9FBD7frxd6quNCs1N4",
        model: process.env.GOOGLE_MODEL || "gemini-2.5-flash",
        maxOutputTokens: 2048,
      });
    } 
    else {
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY || "",
        modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        temperature: 0.7,
      });
    }
  }

  /**
   * Build LangChain message history from stored chatbot history
   */
  private buildMessageHistory(chatHistory: any[]): BaseMessage[] {
    return chatHistory.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      } else {
        return new SystemMessage(msg.content);
      }
    });
  }

  /**
   * Create a conversational chain
   */
  private createChain(chatbot: any, chatHistory: any[]) {
    const messages = this.buildMessageHistory(chatHistory);

    const systemInstructions =
      chatbot.systemPrompt ||
      "You are a helpful AI assistant. Use the provided context to answer questions accurately. If the context doesn't contain the answer, say so.";

    // Single system message — required by Gemini (no multiple system turns allowed)
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `${systemInstructions}\n\nContext:\n{context}`],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    // Create chain using modern approach — pass messages directly
    const chain = RunnableSequence.from([
      {
        input: (input: any) => input.input,
        context: (input: any) => input.context,
        chat_history: (_input: any) => messages,
      },
      prompt,
      this.llm,
    ]);

    return chain;
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

      // Create chain
      const chain = this.createChain(chatbot, chatHistory);

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

      chatbot.chatHistory = [] as any;
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
   * Stream chat responses using SSE (Server-Sent Events)
   */
  async streamChat(chatbotId: string, message: string, res: any) {
    const chatbot = await Chatbot.findById(chatbotId);
    if (!chatbot) throw new Error("Chatbot not found");

    const chatHistory = chatbot.chatHistory || [];

    // Fetch RAG context
    let context = "";
    try {
      const vectorResults = await VectorService.queryVectors(chatbotId, message, 3);
      context = VectorService.formatContext(vectorResults);
    } catch {
      // No context available — proceed without it
    }

    const chain = this.createChain(chatbot, chatHistory);

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullResponse = "";
    const stream = await chain.stream({
      input: message,
      context: context || "No additional context available.",
    });

    for await (const chunk of stream) {
      const token: string = chunk.content || "";
      if (token) {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    // Signal done
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Persist the conversation turn to MongoDB
    chatbot.chatHistory.push({ role: "user", content: message, timestamp: new Date() });
    chatbot.chatHistory.push({ role: "assistant", content: fullResponse, timestamp: new Date() });
    chatbot.updatedAt = new Date();
    await chatbot.save();
  }
}

export default new LangChainService();
