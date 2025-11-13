import { Request, Response, NextFunction } from "express";
import ChatService from "../services/ChatService";

/**
 * Extract domain from a full URL or return the domain as-is
 * Handles both full URLs and plain domain strings
 */
export function extractDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return "";

  try {
    // If it's a full URL, parse it
    if (urlOrDomain.startsWith("http://") || urlOrDomain.startsWith("https://")) {
      const url = new URL(urlOrDomain);
      return url.host.toLowerCase();
    }

    // Otherwise, assume it's already a domain
    // Remove any trailing slashes or paths
    const domain = urlOrDomain.split("/")[0];
    return domain ? domain.toLowerCase() : "";
  } catch (error) {
    // If URL parsing fails, return the original string cleaned up
    const domain = urlOrDomain?.split("/")[0];
    return domain ? domain.toLowerCase() : "";
  }
}

/**
 * Get parent/embedding URL from request headers
 * Tries multiple sources for maximum reliability
 */
export function getParentUrl(req: Request): string {
  // Try custom header first (most reliable if set by client)
  const customHeader = req.headers['x-parent-url'] as string;
  if (customHeader) {
    console.log('📍 Parent URL from X-Parent-URL:', customHeader);
    return customHeader;
  }
  
  // Try referer header (most common for iframe requests)
  const referer = req.get('referer') || req.headers.referer as string;
  if (referer) {
    console.log('📍 Parent URL from Referer:', referer);
    return referer;
  }
  
  // Try origin header (sent with CORS requests)
  const origin = req.headers.origin as string;
  if (origin) {
    console.log('📍 Parent URL from Origin:', origin);
    return origin;
  }
  
  // Try X-Forwarded-Host (if behind proxy)
  const forwardedHost = req.headers['x-forwarded-host'] as string;
  if (forwardedHost) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const url = `${protocol}://${forwardedHost}`;
    console.log('📍 Parent URL from X-Forwarded-Host:', url);
    return url;
  }
  
  // Fallback to host header
  const host = req.get('host');
  if (host) {
    const protocol = req.protocol || 'https';
    const url = `${protocol}://${host}`;
    console.log('📍 Parent URL from Host (fallback):', url);
    return url;
  }
  
  console.warn('⚠️ Could not determine parent URL from any source');
  return '';
}

/**
 * Compare two domains and check if they match
 * Supports exact matching, wildcard subdomains, and localhost variations
 * 
 * @param requestDomain - The domain making the request (e.g., "app.example.com")
 * @param allowedDomain - The whitelisted domain pattern (e.g., "*.example.com")
 * @returns true if domains match, false otherwise
 * 
 * @example
 * compareDomains("app.example.com", "*.example.com") // true
 * compareDomains("example.com", "example.com") // true
 * compareDomains("localhost:3000", "localhost") // true
 * compareDomains("evil.com", "example.com") // false
 */
export function compareDomains(requestDomain: string, allowedDomain: string): boolean {
  if (!requestDomain || !allowedDomain) {
    return false;
  }

  const normalizedRequest = requestDomain.toLowerCase();
  const normalizedAllowed = allowedDomain.toLowerCase();

  // 1. Exact match
  if (normalizedRequest === normalizedAllowed) {
    console.log('✅ Exact match:', normalizedRequest, '===', normalizedAllowed);
    return true;
  }

  // 2. Wildcard subdomain match (e.g., *.example.com)
  if (normalizedAllowed.startsWith('*.')) {
    const baseDomain = normalizedAllowed.substring(2); // Remove "*."
    
    // Check if request domain ends with the base domain
    if (normalizedRequest.endsWith(baseDomain)) {
      console.log('✅ Wildcard subdomain match:', normalizedRequest, 'matches', normalizedAllowed);
      return true;
    }
    
    // Also match the base domain itself (*.example.com should allow example.com)
    if (normalizedRequest === baseDomain) {
      console.log('✅ Wildcard base domain match:', normalizedRequest, 'matches', normalizedAllowed);
      return true;
    }
  }


  // // 4. Port-agnostic comparison (example.com:3000 matches example.com)
  // const requestWithoutPort = normalizedRequest.split(':')[0];
  // const allowedWithoutPort = normalizedAllowed.split(':')[0];
  
  // if (requestWithoutPort === allowedWithoutPort) {
  //   console.log('✅ Port-agnostic match:', normalizedRequest, '≈', normalizedAllowed);
  //   return true;
  // }

  // No match found
  return false;
}

/**
 * Check if a request domain is allowed based on a whitelist
 * 
 * @param requestDomain - The domain making the request
 * @param allowedDomains - Array of whitelisted domain patterns
 * @returns true if domain is allowed, false otherwise
 */
export function isDomainAllowed(requestDomain: string, allowedDomains: string[]): boolean {
  if (!requestDomain) {
    return false;
  }

  if (!allowedDomains || allowedDomains.length === 0) {
    // No whitelist means not allowed
    return false;
  }

  const normalizedRequest = extractDomain(requestDomain);
  
  return allowedDomains.some((allowedDomain) => {
    const normalizedAllowed = extractDomain(allowedDomain);
    return compareDomains(normalizedRequest, normalizedAllowed);
  });
}

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
    const { chatbotId, embedKey } = req.params;
    
    // Get parent URL from multiple sources
    const parentUrl = getParentUrl(req);
    
    // Log headers for debugging
    console.log('🔍 Domain Validation - Request Headers:', {
      referer: req.get('referer'),
      origin: req.headers.origin,
      'x-parent-url': req.headers['x-parent-url'],
      'x-forwarded-host': req.headers['x-forwarded-host'],
      host: req.get('host'),
    });
    
    // Get chatbot to check domain whitelist
    const chatbot = embedKey 
      ? await ChatService.getChatbotByEmbedKey(embedKey as string)
      : await ChatService.getChatbot(chatbotId as string);

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
      console.log('✅ No domain whitelist - allowing all domains');
      return next();
    }

    // If no parent URL could be determined, block for security
    if (!parentUrl) {
      console.warn('⚠️ No parent URL detected - blocking request');
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Could not determine request origin",
      });
    }

    // Extract and validate domain
    const requestDomain = extractDomain(parentUrl);
    
    console.log('🔍 Checking domain:', requestDomain);
    console.log('📋 Allowed domains:', chatbot.allowedDomains);

    // Use the common validation function
    const isAllowed = isDomainAllowed(requestDomain, chatbot.allowedDomains);

    if (!isAllowed) {
      console.error('❌ Domain not whitelisted:', requestDomain);
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Domain not whitelisted for this chatbot",
        details: {
          requestDomain,
          parentUrl,
          allowedDomains: chatbot.allowedDomains
        }
      });
    }

    console.log('✅ Domain validated:', requestDomain);
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

