import axios from "axios";

/**
 * Service to fetch context from RAG vector server
 */
export class VectorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.RAG_SERVER_URL+'/api' || "http://localhost:5000/api";
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

  /**
   * Upload single document to RAG server
   */
  async uploadDocument(chatbotId: string, file: Express.Multer.File) {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await axios.post(
        `${this.baseUrl}/chatbots/${chatbotId}/documents`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          timeout: 30000, // 30 second timeout for file uploads
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error uploading document:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to upload document",
      };
    }
  }

  /**
   * Upload multiple documents to RAG server
   */
  async uploadDocuments(chatbotId: string, files: Express.Multer.File[]) {
    const results = [];
    const errors = [];

    for (const file of files) {
      const result = await this.uploadDocument(chatbotId, file);
      
      if (result.success) {
        results.push({
          filename: file.originalname,
          ...result.data
        });
      } else {
        errors.push({
          filename: file.originalname,
          error: result.error
        });
      }
    }

    return {
      success: errors.length === 0,
      uploaded: results,
      failed: errors,
      totalUploaded: results.length,
      totalFailed: errors.length
    };
  }

  /**
   * Get all documents for a chatbot
   */
  async getDocuments(chatbotId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/chatbots/${chatbotId}/documents`,
        {
          timeout: 10000,
        }
      );

      return {
        success: true,
        data: response.data.data || [],
      };
    } catch (error: any) {
      console.error("Error fetching documents:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to fetch documents",
      };
    }
  }

  /**
   * Delete a document from RAG server
   */
  async deleteDocument(chatbotId: string, documentId: string) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/chatbots/${chatbotId}/documents/${documentId}`,
        {
          timeout: 10000,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error deleting document:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to delete document",
      };
    }
  }

  /**
   * Delete all documents for a chatbot
   */
  async deleteAllDocuments(chatbotId: string) {
    try {
      const response = await axios.delete(
        `${this.baseUrl}/chatbots/${chatbotId}/documents`,
        {
          timeout: 10000,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("Error deleting documents:", error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to delete documents",
      };
    }
  }
}

export default new VectorService();

