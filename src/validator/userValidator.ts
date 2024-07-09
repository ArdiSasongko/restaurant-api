import { z } from "zod";

export class userValidator {
    static register = z.object({
        name: z.string().min(3).max(255),
        email: z.string().email(),
        username: z.string().min(3).max(255),
        password: z.string().min(6).max(255),
        //role: z.enum(['buyer', 'seller'], { message: 'Role must be buyer or seller' })
    })

    static updateProfile = z.object({
        username: z.string().min(3).max(255).optional(),
    })

    static login = z.object({
        email: z.string().email().optional(),
        username: z.string().min(3).max(255).optional(),
        password: z.string().min(6).max(255),
    })

    static token = z.object({
        token: z.string({ message: "Need TOKEN for verifications email" })
    })

    static forgetPassword = z.object({
        email: z.string().email()
    })

    static resetPassword = z.object({
        email: z.string().email(),
        token: z.string({ message: "Need TOKEN for reset password" }),
        new_password: z.string().min(6).max(255),
        valid_password: z.string().min(6).max(255)
    })
}