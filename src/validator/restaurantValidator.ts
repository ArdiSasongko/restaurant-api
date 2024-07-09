import { z } from "zod";

export class restaurantValidator {
    static create = z.object({
        name: z.string().min(3).max(255),
        location: z.string().min(3).max(255),
        open_time: z.string({ message: "example open_time: 19:00" }).min(3).max(255),
        close_time: z.string({ message: "example close_time: 19:00" }).min(3).max(255),
    })

    static update = z.object({
        name: z.string().min(3).max(255).optional(),
        location: z.string().min(3).max(255).optional(),
        open_time: z.string().min(3).max(255).optional(),
        close_time: z.string().min(3).max(255).optional(),
    })

}