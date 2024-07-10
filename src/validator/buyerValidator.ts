import { z } from "zod";

export class BuyerValidator {
    static create = z.object({
        quantity: z.number().int().positive(),
        total_price: z.number().int().positive(),
    })
}