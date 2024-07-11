import express from 'express';
import { RestaurantService } from '../service/restaurantService';
import { CustomError, formatZodError, handleError } from '../utils/customError';
import { v2 as cloudinary } from 'cloudinary';
import { ZodError } from 'zod';
import { restaurantModel } from '../model/restaurantModel';
import { MenuService } from '../service/menuService';
import { menuModel } from '../model/menuModel';
import { BuyerService } from '../service/buyerService';

export class RestaurantController {
    // for create new restaurant
    static async create(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { body: data, file } = req
        const id = req.user.id
        try {
            const defaultBanner = Bun.env.DEFAULT_BANNER!
            const result = await RestaurantService.createRestaurant(data, id, file, defaultBanner)
            res.status(201).json({
                status_code: 201,
                message: 'Success to create restaurant',
                data: result
            })
        } catch (error) {
            await handleError(file, error, next)
        }
    }

    // for update restaurant
    static async update(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { body: data, file, params: { restaurant_id } } = req
        try {
            const result = await RestaurantService.updateRestaurant(data, restaurant_id, file)
            res.status(200).json({
                status_code: 200,
                message: 'Success to update restaurant',
                data: result
            })
        } catch (error) {
            await handleError(file, error, next)
        }
    }

    // for get all restaurants
    static async getRestaurants(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const result = await restaurantModel.find().select('banner name location open_time close_time')
            if (!result) throw new CustomError(404, 'Restaurants not found')
            res.status(200).json({
                status_code: 200,
                message: 'Success to get all restaurants',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    // for get restaurant (one restaurant)
    static async getRestaurant(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        try {
            const result = await restaurantModel
                .findById(restaurant_id)
                .select('banner name location open_time close_time')
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

    // for create new menu
    static async createMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { body: data, file, params: { restaurant_id } } = req
        try {
            const defaultPicture = Bun.env.DEFAULT_MENU!
            const result = await MenuService.create(data, restaurant_id, file, defaultPicture)
            res.status(201).json({
                status_code: 201,
                message: 'Success to create menu',
                restaurant_id: `${restaurant_id}`,
                data: result
            })
        } catch (error) {
            await handleError(file, error, next)
        }
    }

    // for update menu
    static async updateMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { body: data, file, params: { restaurant_id, menu_id } } = req

        try {
            const result = await MenuService.update(data, restaurant_id, menu_id, file)
            res.status(200).json({
                status_code: 200,
                message: 'Success to update menu',
                restaurant_id: `${restaurant_id}`,
                data: result
            })
        } catch (error) {
            await handleError(file, error, next)
        }
    }

    // for get all menus
    static async getMenus(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        try {
            const result = await menuModel.find({ restaurant_id: restaurant_id }).select('name picture price')
            if (!result) throw new CustomError(404, 'Menus not found')
            res.status(200).json({
                status_code: 200,
                message: 'Success to get all menus',
                restaurant_id: `${restaurant_id}`,
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
    // for get menu (one menu)
    static async getMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { params: { restaurant_id, menu_id } } = req
        try {
            const result = await menuModel
                .findOne({ restaurant_id: restaurant_id, _id: menu_id })
                .select('name picture price description amount')

            if (!result) throw new CustomError(400, 'Menu not found')
            res.status(200).json({
                status_code: 200,
                message: 'Success to get menu',
                restaurant_id: `${restaurant_id}`,
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    // for delete menu
    static async deleteMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { params: { restaurant_id, menu_id } } = req
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
                message: 'Success to delete menu',
                restaurant_id: `${restaurant_id}`,
            })

        } catch (error) {
            next(error)
        }
    }

    static async buy(req: express.Request, res: express.Response, next: express.NextFunction) {
        const { body: data, params: { restaurant_id, menu_id } } = req
        const id = req.user.id
        try {
            const result = await BuyerService.createOrder(data, restaurant_id, menu_id, id)
            res.status(201).json({
                status_code: 201,
                message: `Success create order, this is your change ${result.change}`,
                restaurant_id: `${restaurant_id}`,
            })
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                return next(new CustomError(400, "Validation Error", formattedErrors))
            }
            next(error)
        }
    }
}

