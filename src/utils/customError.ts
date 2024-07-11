import { ZodError } from "zod";
import { v2 as cloudinary } from 'cloudinary'
import express from 'express'
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

export async function handleError(file: any, error: any, next: express.NextFunction) {
    if (file) cloudinary.uploader.destroy(file.filename);
    if (error instanceof ZodError) {
        const formattedErrors = formatZodError(error)
        return next(new CustomError(400, "Validation Error", formattedErrors))
    }
    next(error)
}