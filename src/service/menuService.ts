import { ZodError } from "zod";
import { menuModel } from "../model/menuModel";
import { CustomError, formatZodError } from "../utils/customError";
import { menuValidator } from "../validator/menuValidator";
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'
import moment from "moment-timezone";
import { restaurantModel } from "../model/restaurantModel";
import { deleteImage, uploadImage } from "../utils/cloudinary";

export class MenuService {
    static async create(data: any, restaurant_id: string, file: Express.Multer.File | undefined, image: string) {
        try {
            const request = await menuValidator.create.parseAsync(data)

            // check if menu already exists
            const menu = await menuModel.findOne({ restaurant_id, name: request.name })
            if (menu) throw new CustomError(400, 'Menu already exists')

            // save picture to cloudinary
            const imgUrl = file ? await uploadImage(file, 'menu') : image

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
            handleError(error)
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

            // update field
            const updateFields = {
                name: request.name || menu.name,
                picture: menu.picture,
                price: request.price || menu.price,
                description: request.description || menu.description,
                amount: request.amount || menu.amount,
                updated_at: moment().tz('Asia/Jakarta', true).format()
            }

            // if update file
            if (file) {
                updateFields.picture = await uploadImage(file, 'menu')
                await deleteImage(menu.picture!, 'menu')
            }

            // save update to database

            const updateMenu = await menuModel.findByIdAndUpdate(menu_id, updateFields, { new: true })
                .select('name picture price description amount updated_at')

            if (!updateMenu) throw new CustomError(400, 'Failed to update menu')

            return updateMenu
        } catch (error) {
            handleError(error)
        }
    }
}

function handleError(error: any): never {
    if (error instanceof ZodError) {
        const formattedErrors = formatZodError(error)
        throw new CustomError(400, "Validation Error", formattedErrors);
    }
    throw error;
}