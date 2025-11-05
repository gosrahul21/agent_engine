import * as express from "express";
import { z } from "zod";
/**
 * Validation middleware factory
 */
export declare const validate: (schema: z.ZodSchema, location?: "body" | "params" | "query") => (req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
/**
 * Validate multiple locations at once
 */
export declare const validateMultiple: (schemas: {
    body?: z.ZodSchema;
    params?: z.ZodSchema;
    query?: z.ZodSchema;
}) => (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<express.Response<any, Record<string, any>> | undefined>;
/**
 * Sanitization middleware
 */
export declare const sanitize: () => (req: express.Request, res: express.Response, next: express.NextFunction) => void;
/**
 * Custom error handler for validation errors
 */
export declare const validationErrorHandler: (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => express.Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=middleware.d.ts.map