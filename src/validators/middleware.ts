import * as express from "express";
import { z, ZodError } from "zod";

/**
 * Validation middleware factory
 */
export const validate = (schema: z.ZodSchema, location: "body" | "params" | "query" = "body") => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const data = location === "body" ? req.body : location === "params" ? req.params : req.query;
      
      const validated = schema.parse(data);
      console.log(validated)
      // Replace the original data with validated data
      if (location === "body") {
        req.body = validated;
      } else if (location === "params") {
        req.params = validated as any;
      } else {
        // In Express 5, req.query is read-only, so we extend it instead
        Object.assign(req.query, validated);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Invalid input data",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred during validation"
      });
    }
  };
};

/**
 * Validate multiple locations at once
 */
export const validateMultiple = (
  schemas: {
    body?: z.ZodSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
  }
) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      
      // Validate params
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as any;
      }
      
      // Validate query (Express 5: req.query is read-only)
      if (schemas.query) {
        const validated = schemas.query.parse(req.query);
        Object.assign(req.query, validated);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Invalid input data",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code
          }))
        });
      }
      
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred during validation"
      });
    }
  };
};

/**
 * Sanitization middleware
 */
export const sanitize = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Sanitize body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query (Express 5: req.query is read-only)
    if (req.query && typeof req.query === "object") {
      const sanitized = sanitizeObject(req.query);
      Object.assign(req.query, sanitized);
    }
    
    next();
  };
};

/**
 * Recursively sanitize object
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  if (typeof obj === "string") {
    // Remove potential XSS
    return obj
      .replace(/[<>]/g, "")
      .trim();
  }
  
  return obj;
}

/**
 * Custom error handler for validation errors
 */
export const validationErrorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      message: "Invalid input data",
      details: err.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
        code: error.code
      }))
    });
  }
  
  next(err);
};

