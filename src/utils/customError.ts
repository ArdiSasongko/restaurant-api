import type { ZodError } from "zod";

// custom error class to handle custom error messages response
export class CustomError extends Error {
    data?: any
    constructor(public statusCode: number, message: string, data?: any) {
        super(message);
        this.statusCode = statusCode;
        this.data = data
    }
}

// handler error from zod validation
export const formatZodError = (error: ZodError) => {
    return error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
    }))
}