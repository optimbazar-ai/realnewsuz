// Rate Limiter configuration for API protection
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

// General API rate limiter - 100 requests per minute
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        error: "Juda ko'p so'rov yuborildi. Iltimos, bir daqiqa kutib turing.",
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: "Juda ko'p so'rov yuborildi. Iltimos, bir daqiqa kutib turing.",
            retryAfter: 60,
        });
    },
});

// Stricter rate limiter for auth endpoints - 5 requests per minute
export const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute
    message: {
        error: "Juda ko'p kirish urinishlari. Iltimos, bir daqiqa kutib turing.",
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: "Juda ko'p kirish urinishlari. Iltimos, bir daqiqa kutib turing.",
            retryAfter: 60,
        });
    },
});

// AI generation rate limiter - 10 requests per minute (expensive operations)
export const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        error: "AI generatsiya uchun juda ko'p so'rov. Iltimos, kutib turing.",
        retryAfter: 60,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            error: "AI generatsiya uchun juda ko'p so'rov. Iltimos, kutib turing.",
            retryAfter: 60,
        });
    },
});
