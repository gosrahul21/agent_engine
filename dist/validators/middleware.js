"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationErrorHandler = exports.sanitize = exports.validateMultiple = exports.validate = void 0;
var zod_1 = require("zod");
/**
 * Validation middleware factory
 */
var validate = function (schema, location) {
    if (location === void 0) { location = "body"; }
    return function (req, res, next) {
        try {
            var data = location === "body" ? req.body : location === "params" ? req.params : req.query;
            var validated = schema.parse(data);
            console.log(validated);
            // Replace the original data with validated data
            if (location === "body") {
                req.body = validated;
            }
            else if (location === "params") {
                req.params = validated;
            }
            else {
                // In Express 5, req.query is read-only, so we extend it instead
                Object.assign(req.query, validated);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: "Validation error",
                    message: "Invalid input data",
                    details: error.errors.map(function (err) { return ({
                        field: err.path.join("."),
                        message: err.message,
                        code: err.code
                    }); })
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
exports.validate = validate;
/**
 * Validate multiple locations at once
 */
var validateMultiple = function (schemas) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var validated;
        return __generator(this, function (_a) {
            try {
                // Validate body
                if (schemas.body) {
                    req.body = schemas.body.parse(req.body);
                }
                // Validate params
                if (schemas.params) {
                    req.params = schemas.params.parse(req.params);
                }
                // Validate query (Express 5: req.query is read-only)
                if (schemas.query) {
                    validated = schemas.query.parse(req.query);
                    Object.assign(req.query, validated);
                }
                next();
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: "Validation error",
                            message: "Invalid input data",
                            details: error.errors.map(function (err) { return ({
                                field: err.path.join("."),
                                message: err.message,
                                code: err.code
                            }); })
                        })];
                }
                return [2 /*return*/, res.status(500).json({
                        success: false,
                        error: "Internal server error",
                        message: "An unexpected error occurred during validation"
                    })];
            }
            return [2 /*return*/];
        });
    }); };
};
exports.validateMultiple = validateMultiple;
/**
 * Sanitization middleware
 */
var sanitize = function () {
    return function (req, res, next) {
        // Sanitize body
        if (req.body && typeof req.body === "object") {
            req.body = sanitizeObject(req.body);
        }
        // Sanitize query (Express 5: req.query is read-only)
        if (req.query && typeof req.query === "object") {
            var sanitized = sanitizeObject(req.query);
            Object.assign(req.query, sanitized);
        }
        next();
    };
};
exports.sanitize = sanitize;
/**
 * Recursively sanitize object
 */
function sanitizeObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(function (item) { return sanitizeObject(item); });
    }
    if (obj !== null && typeof obj === "object") {
        var sanitized = {};
        for (var key in obj) {
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
var validationErrorHandler = function (err, req, res, next) {
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            error: "Validation error",
            message: "Invalid input data",
            details: err.errors.map(function (error) { return ({
                field: error.path.join("."),
                message: error.message,
                code: error.code
            }); })
        });
    }
    next(err);
};
exports.validationErrorHandler = validationErrorHandler;
//# sourceMappingURL=middleware.js.map