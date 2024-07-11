import { restaurantModel } from "../model/restaurantModel";
import { CustomError, formatZodError } from "../utils/customError";
import { restaurantValidator } from "../validator/restaurantValidator";
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { ZodError } from "zod";
import moment from "moment-timezone";
import { deleteImage, uploadImage } from "../utils/cloudinary";

export class RestaurantService {
    static async createRestaurant(data: any, id: string, file: Express.Multer.File | undefined, image: string) {
        try {
            const request = await restaurantValidator.create.parseAsync(data)

            // check the name restaurant if exists
            await checkRestaurantName(request.name)

            // owner only can create one restaurant
            await ownerRestaurant(id)

            // save banner to cloudinary
            const imgUrl = file ? await uploadImage(file, 'banner-restaurant') : image

            // create object for save information
            const newRestaurant = {
                owner_id: id,
                name: request.name,
                location: request.location,
                banner: imgUrl,
                open_time: request.open_time,
                close_time: request.close_time,
            }

            // save to database
            const saveRestaurant = await restaurantModel.create(newRestaurant)

            if (!saveRestaurant) throw new CustomError(400, 'Failed to create restaurant')

            return saveRestaurant
        } catch (error) {
            handleError(error)
        }
    }

    static async updateRestaurant(data: any, restaurant_id: string, file: Express.Multer.File | undefined) {
        try {
            const request = await restaurantValidator.update.parseAsync(data)

            // check the restaurant if exists
            const restaurant = await restaurantModel.findById(restaurant_id)
            if (!restaurant) throw new CustomError(400, 'Restaurant not found')

            // check if name restaurant already exists
            await checkRestaurantName(request.name!)

            // check update field
            const updateFields = {
                name: request.name || restaurant.name,
                location: request.location || restaurant.location,
                banner: restaurant.banner,
                open_time: request.open_time || restaurant.open_time,
                close_time: request.close_time || restaurant.close_time,
                updated_at: moment().tz('Asia/Jakarta').format()
            }

            // check if update file banner
            if (file) {
                updateFields.banner = await uploadImage(file, 'banner-restaurant')
                await deleteImage(restaurant.banner!, 'banner-restaurant')
            }

            // update restaurant
            const updateRestaurant = await restaurantModel.findByIdAndUpdate(restaurant_id, updateFields, { new: true })
                .select(`name location banner open_time close_time updated_at`)

            if (!updateRestaurant) throw new CustomError(400, 'Failed to update restaurant')

            return updateRestaurant
        } catch (error) {
            handleError(error)
        }
    }
}

async function checkRestaurantName(name: string): Promise<void> {
    const restaurantName = await restaurantModel.findOne({ name: name })
    if (restaurantName) throw new CustomError(400, 'Restaurant name already exists')
}

async function ownerRestaurant(id: string): Promise<void> {
    const restaurantOwner = await restaurantModel.findOne({ owner_id: id })
    if (restaurantOwner) throw new CustomError(400, 'Owner only can create one restaurant')
}

function handleError(error: any): never {
    if (error instanceof ZodError) {
        const formattedErrors = formatZodError(error)
        throw new CustomError(400, "Validation Error", formattedErrors);
    }
    throw error;
}