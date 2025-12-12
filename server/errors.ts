// Custom Error classes for better error handling

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resurs topilmadi") {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message: string = "Yaroqsiz ma'lumotlar") {
        super(message, 400);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Autentifikatsiya talab qilinadi") {
        super(message, 401);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Ruxsat berilmagan") {
        super(message, 403);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Juda ko'p so'rov") {
        super(message, 429);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = "Ma'lumotlar bazasi xatosi") {
        super(message, 500);
    }
}

export class ExternalServiceError extends AppError {
    constructor(service: string, message: string = "Tashqi xizmat xatosi") {
        super(`${service}: ${message}`, 503);
    }
}

// Error handler helper
export function handleError(error: unknown): AppError {
    if (error instanceof AppError) {
        return error;
    }

    if (error instanceof Error) {
        return new AppError(error.message, 500);
    }

    return new AppError("Noma'lum xatolik yuz berdi", 500);
}
