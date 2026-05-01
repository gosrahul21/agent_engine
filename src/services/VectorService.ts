import axios from "axios";
import * as FormData from "form-data";
import * as fs from "fs";

/**
 * Service to fetch context from RAG vector server
 */
export class VectorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.RAG_SERVER_URL || "http://localhost:3000/api";
  }

  /**
   * Upload document to vector store for a chatbot
   */
  async uploadDocument(chatbotId: string, file: Express.Multer.File) {
    try {
      const formData = new FormData();
      formData.append("document", fs.createReadStream(file.path), file.originalname);

      const response = await axios.post(
        `${this.baseUrl}/upload?projectId=${chatbotId}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 60000, // 60 seconds timeout for uploads
        }
      );

      // Clean up the temporary file created by multer
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.warn("Failed to clean up temp file:", file.path);
      }

      return response.data;
    } catch (error: any) {
      console.error("Error uploading document:", error.message);
      
      // Attempt cleanup on error as well
      try {
        fs.unlinkSync(file.path);
      } catch (e) {}

      throw error;
    }
  }

  /**
   * Query vector store for relevant context
   */
  async queryVectors(chatbotId: string, query: string, topK: number = 3) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/retrieve`,
        {
          query,
          projectId: chatbotId,
          topK,
        },
        {
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.status === 'success' && response.data.data) {
        return response.data.data.chunks || [];
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
    // This could optionally call a health or status endpoint on RAG pipeline if needed
    // For now we'll just return true to bypass checks, or implement a call if necessary
    return true;
  }

  /**
   * Format vector results into context string
   */
  formatContext(results: any[]): string {
    if (!results || results.length === 0) {
      return "";
    }

    const contextParts = results.map((result, index) => {
      const source = result.originalname || result.filename || "Unknown";
      const content = result.text || "";
      return `[Source ${index + 1}: ${source}]\n${content}`;
    });

    return contextParts.join("\n\n");
  }
}

export default new VectorService();

