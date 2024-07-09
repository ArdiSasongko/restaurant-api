import express from 'express';
import { RestaurantService } from '../service/restaurantService';
import { CustomError, formatZodError } from '../utils/customError';
import { v2 as cloudinary } from 'cloudinary';
import { ZodError } from 'zod';
import { restaurantModel } from '../model/restaurantModel';
import { MenuService } from '../service/menuService';
import { menuModel } from '../model/menuModel';

export class RestaurantController {
    static async create(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const id = (req as any).user.id
        const file = req.file
        try {
            const defaultBanner = Bun.env.DEFAULT_BANNER!
            const result = await RestaurantService.createRestaurant(data, id, file, defaultBanner)

            if (!result) throw new CustomError(400, "failed to create restaurant")

            res.status(201).json({
                status_code: 201,
                message: 'Success to create restaurant',
                data: result
            })
        } catch (error) {
            if (file) {
                // Delete the uploaded file if it exists and an error occurred
                cloudinary.uploader.destroy(file.filename);
            }
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                return next(new CustomError(400, "Validation Error", formattedErrors))
            }
            next(error)
        }
    }

    static async update(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const restaurant_id = req.params.restaurant_id
        const file = req.file

        try {
            const result = await RestaurantService.updateRestaurant(data, restaurant_id, file)

            if (!result) throw new CustomError(400, 'Failed to update restaurant')

            res.status(200).json({
                status_code: 200,
                message: 'Success to update restaurant',
                data: result
            })
        } catch (error) {
            if (file) {
                // Delete the uploaded file if it exists and an error occurred
                cloudinary.uploader.destroy(file.filename);
            }
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                return next(new CustomError(400, "Validation Error", formattedErrors))
            }
            next(error)
        }
    }

    static async getRestaurant(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        try {
            const result = await restaurantModel
                .findById(restaurant_id)
                .select('banner name location open_time close_time menus')
                .populate({
                    path: 'menus',
                    select: 'name price picture'
                })

            if (!result) throw new CustomError(400, 'Restaurant not found')

            res.status(200).json({
                status_code: 200,
                message: 'Success to get restaurant',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async createMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const restaurant_id = req.params.restaurant_id
        const file = req.file
        try {
            const defaultPicture = Bun.env.DEFAULT_MENU!
            const result = await MenuService.create(data, restaurant_id, file, defaultPicture)

            if (!result) throw new CustomError(400, 'Failed to create menu')

            res.status(201).json({
                status_code: 201,
                message: 'Success to create menu',
                data: result
            })
        } catch (error) {
            if (file) {
                // Delete the uploaded file if it exists and an error occurred
                cloudinary.uploader.destroy(file.filename);
            }
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                return next(new CustomError(400, "Validation Error", formattedErrors))
            }
            next(error)
        }
    }

    static async updateMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const restaurant_id = req.params.restaurant_id
        const menu_id = req.params.menu_id
        const file = req.file

        try {
            const result = await MenuService.update(data, restaurant_id, menu_id, file)

            if (!result) throw new CustomError(400, 'Failed to update menu')

            res.status(200).json({
                status_code: 200,
                message: 'Success to update menu',
                data: result
            })
        } catch (error) {
            if (file) {
                // Delete the uploaded file if it exists and an error occurred
                cloudinary.uploader.destroy(file.filename);
            }
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                return next(new CustomError(400, "Validation Error", formattedErrors))
            }
            next(error)
        }
    }

    static async getMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const menu_id = req.params.menu_id
        try {
            const result = await menuModel
                .findOne({ restaurant_id: restaurant_id, _id: menu_id })
                .select('name picture price description amount')

            if (!result) throw new CustomError(400, 'Menu not found')

            res.status(200).json({
                status_code: 200,
                message: 'Success to get menu',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async deleteMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const menu_id = req.params.menu_id
        try {
            const result = await menuModel
                .findOneAndDelete({ restaurant_id: restaurant_id, _id: menu_id })

            if (!result) throw new CustomError(400, 'Menu not found')

            // delete image from cloudinary
            if (result.picture) {
                const public_id = result.picture.split('/').pop()?.split('.')[0]
                if (public_id) {
                    await cloudinary.uploader.destroy(public_id)
                }
            }

            res.status(200).json({
                status_code: 200,
                message: 'Success to delete menu'
            })

        } catch (error) {
            next(error)
        }
    }
}