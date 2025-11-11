import { Request, Response, NextFunction } from "express";
import ChatService from "../services/ChatService";

/**
 * Middleware to validate domain access for embedded chatbots
 * Checks if the request origin is in the chatbot's allowed domains list
 */
export const validateDomain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chatbotId } = req.params;
    const origin = req.get("origin") || req.get("referer") || "";

    // Get chatbot to check domain whitelist
    const chatbot = await ChatService.getChatbot(chatbotId as string);

    if (!chatbot) {
      return res.status(404).json({
        success: false,
        error: "Not found",
        message: "Chatbot not found",
      });
    }

    // Check if chatbot is embeddable
    if (!chatbot.isEmbeddable) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "This chatbot is not embeddable",
      });
    }

    // If no domains are whitelisted, allow all
    if (!chatbot.allowedDomains || chatbot.allowedDomains.length === 0) {
      return next();
    }

    // Extract domain from origin
    const requestDomain = extractDomain(origin);

    // Check if the request domain is in the allowed list
    const isAllowed = chatbot.allowedDomains.some((allowedDomain: string) => {
      const normalizedAllowed = extractDomain(allowedDomain);
      return (
        requestDomain === normalizedAllowed ||
        requestDomain.endsWith(`.${normalizedAllowed}`)
      );
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Domain not whitelisted for this chatbot",
      });
    }

    next();
  } catch (error: any) {
    console.error("Domain validation error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message || "Failed to validate domain",
    });
  }
};

/**
 * Extract domain from a full URL or return the domain as-is
 */
function extractDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return "";

  try {
    // If it's a full URL, parse it
    if (urlOrDomain.startsWith("http://") || urlOrDomain.startsWith("https://")) {
      const url = new URL(urlOrDomain);
      return url.hostname;
    }

    // Otherwise, assume it's already a domain
    // Remove any trailing slashes or paths
    return urlOrDomain?.split("/")[0]?.toLowerCase() || "";
  } catch (error) {
    // If URL parsing fails, return the original string cleaned up
    return urlOrDomain?.split("/")[0]?.toLowerCase() || "";
  }
}

