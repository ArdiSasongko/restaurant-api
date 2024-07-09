import { z } from "zod";

export class menuValidator {
    static create = z.object({
        name: z.string().min(3).max(255),
        price: z.number().nonnegative({ message: "Price must be a positive number" }),
        description: z.string().min(3).max(255),
        amount: z.number().nonnegative({ message: "Amount must be a positive number" }),
    })

    static update = z.object({
        name: z.string().min(3).max(255).optional(),
        price: z.number().nonnegative({ message: "Price must be a positive number" }).optional(),
        description: z.string().min(3).max(255).optional(),
        amount: z.number().nonnegative({ message: "Amount must be a positive number" }).optional(),
    })
}