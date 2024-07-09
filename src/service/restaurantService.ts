import { restaurantModel } from "../model/restaurantModel";
import { CustomError, formatZodError } from "../utils/customError";
import { restaurantValidator } from "../validator/restaurantValidator";
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { ZodError } from "zod";
import moment from "moment-timezone";

export class RestaurantService {
    static async createRestaurant(data: any, id: string, file: Express.Multer.File | undefined, image: string) {
        try {
            const request = await restaurantValidator.create.parseAsync(data)

            // check the name restaurant if exists
            const restaurantName = await restaurantModel.findOne({ name: request.name })
            if (restaurantName) throw new CustomError(400, 'Restaurant name already exists')

            // owner only can create one restaurant
            const restaurantOwner = await restaurantModel.findOne({ owner_id: id })
            if (restaurantOwner) throw new CustomError(400, 'Owner only can create one restaurant')

            // save banner to cloudinary
            console.log(image);
            let imgUrl = image

            if (file) {
                const stream = Readable.from(file.buffer)
                const uploadResult = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader.upload_stream({
                        folder: 'banner-restaurant'
                    }, (error, result) => {
                        if (error) {
                            reject(error)
                        }
                        resolve(result)
                    })
                    stream.pipe(cloudStream)
                })
                imgUrl = (uploadResult as any).secure_url
            }

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
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }

    static async updateRestaurant(data: any, restaurant_id: string, file: Express.Multer.File | undefined) {
        try {
            const request = await restaurantValidator.update.parseAsync(data)

            // check the restaurant if exists
            const restaurant = await restaurantModel.findById(restaurant_id)

            if (!restaurant) throw new CustomError(400, 'Restaurant not found')

            // check if name restaurant already exists
            const restaurantName = await restaurantModel.findOne({ name: request.name })
            if (restaurantName) throw new CustomError(400, 'Restaurant name already exists')

            // check if not update name
            if (!request.name) request.name = restaurant.name

            // check if not update location
            if (!request.location) request.location = restaurant.location

            // check if not update open time
            if (!request.open_time) request.open_time = restaurant.open_time

            // check if not update close time
            if (!request.close_time) request.close_time = restaurant.close_time

            // check if update banner
            let imgUrl = restaurant.banner

            if (file) {
                const stream = Readable.from(file.buffer)
                const uploadResult = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader.upload_stream({
                        folder: 'banner-restaurant'
                    }, (error, result) => {
                        if (error) {
                            reject(error)
                        }
                        resolve(result)
                    })
                    stream.pipe(cloudStream)
                })
                imgUrl = (uploadResult as any).secure_url

                // delete old banner
                if (restaurant.banner) {
                    const public_id = restaurant.banner.split('/').pop()?.split('.')[0]
                    if (public_id) {
                        await cloudinary.uploader.destroy(`banner-restaurant/${public_id}`)
                    }
                }
            }

            // update restaurant
            const updateRestaurant = await restaurantModel.findByIdAndUpdate(restaurant_id, {
                name: request.name,
                location: request.location,
                banner: imgUrl,
                open_time: request.open_time,
                close_time: request.close_time,
                updated_at: moment().tz('Asia/Jakarta').format()
            }, {
                new: true
            }).select(`name location banner open_time close_time updated_at`)

            if (!updateRestaurant) throw new CustomError(400, 'Failed to update restaurant')

            return updateRestaurant
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }
}