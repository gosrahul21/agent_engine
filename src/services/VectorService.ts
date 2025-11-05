import axios from "axios";

/**
 * Service to fetch context from RAG vector server
 */
export class VectorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.RAG_SERVER_URL || "http://localhost:5000/api";
  }

  /**
   * Query vector store for relevant context
   */
  async queryVectors(chatbotId: string, query: string, topK: number = 3) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/chatbots/${chatbotId}/vectors/query`,
        {
          query,
          topK,
        },
        {
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.results || [];
      }

      return [];
    } catch (error: any) {
      console.error("Error querying vector store:", error.message);
      return [];
    }
  }

  /**
   * Check if vector store is ready for a chatbot
   */
  async checkVectorStatus(chatbotId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/chatbots/${chatbotId}/vectors/status`,
        {
          timeout: 5000,
        }
      );

      return response.data.success && response.data.data?.has_vectors;
    } catch (error: any) {
      console.error("Error checking vector status:", error.message);
      return false;
    }
  }

  /**
   * Format vector results into context string
   */
  formatContext(results: any[]): string {
    if (!results || results.length === 0) {
      return "";
    }

    const contextParts = results.map((result, index) => {
      const source = result.metadata?.source || "Unknown";
      const content = result.content || "";
      return `[Source ${index + 1}: ${source}]\n${content}`;
    });

    return contextParts.join("\n\n");
  }
}

export default new VectorService();

