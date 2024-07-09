import { ZodError } from "zod";
import { menuModel } from "../model/menuModel";
import { CustomError, formatZodError } from "../utils/customError";
import { menuValidator } from "../validator/menuValidator";
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import moment from "moment-timezone";
import { restaurantModel } from "../model/restaurantModel";

export class MenuService {
    static async create(data: any, restaurant_id: string, file: Express.Multer.File | undefined, image: string) {
        try {
            const request = await menuValidator.create.parseAsync(data)

            // check if menu already exists
            const menu = await menuModel.findOne({ restaurant_id, name: request.name })
            if (menu) throw new CustomError(400, 'Menu already exists')

            // save picture to cloudinary
            let imgUrl = image

            if (file) {
                const stream = Readable.from(file.buffer)
                const uploadResult = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader.upload_stream({
                        folder: 'menu'
                    }, (error, result) => {
                        if (error) reject(error)
                        resolve(result)
                    })
                    stream.pipe(cloudStream)
                })

                imgUrl = (uploadResult as any).secure_url
            }

            // create object for save information
            const newMenu = {
                restaurant_id: restaurant_id,
                name: request.name,
                picture: imgUrl,
                price: request.price,
                description: request.description,
                amount: request.amount,
            }

            // save to database tabel menu
            const saveMenu = await menuModel.create(newMenu)

            // save to database tabel restaurant
            await restaurantModel.findByIdAndUpdate(restaurant_id, {
                $push: { menus: saveMenu._id },
            })

            if (!saveMenu) throw new CustomError(400, 'Failed to create menu')

            return saveMenu
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Errors", formattedErrors)
            }
            throw error
        }
    }

    static async update(data: any, restaurant_id: string, menu_id: string, file: Express.Multer.File | undefined) {
        try {
            const request = await menuValidator.update.parseAsync(data)

            // check if menu already exists
            const menu = await menuModel.findOne({ restaurant_id: restaurant_id, _id: menu_id })
            if (!menu) throw new CustomError(400, 'Menu not found')

            // check if name menu already exists
            if (request.name === menu.name) throw new CustomError(400, 'Menu name already exists')

            // check if not update name
            if (!request.name) request.name = menu.name

            // check if not updare price
            if (!request.price) request.price = menu.price

            // check if not update description
            if (!request.description) request.description = menu.description!

            // check if not update amount
            if (!request.amount) request.amount = menu.amount

            // if update picture
            let imgUrl = menu.picture

            if (file) {
                const stream = Readable.from(file.buffer)
                const uploadResult = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader.upload_stream({
                        folder: 'menu'
                    }, (error, result) => {
                        if (error) reject(error)
                        resolve(result)
                    })
                    stream.pipe(cloudStream)
                })

                imgUrl = (uploadResult as any).secure_url

                // delete old picture
                if (menu.picture) {
                    const public_id = menu.picture.split('/').pop()?.split('.')[0]
                    if (public_id) {
                        await cloudinary.uploader.destroy(public_id)
                    }
                }
            }

            // save update to database

            const updateMenu = await menuModel.findByIdAndUpdate(menu_id, {
                name: request.name,
                picture: imgUrl,
                price: request.price,
                description: request.description,
                amount: request.amount,
                updated_at: moment().tz('Asia/Jakarta', true).format()
            }, {
                new: true
            }).select('name picture price description amount updated_at')

            if (!updateMenu) throw new CustomError(400, 'Failed to update menu')

            return updateMenu
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Errors", formattedErrors)
            }
            throw error
        }
    }
}