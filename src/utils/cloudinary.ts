import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream'
import { CustomError } from './customError';

cloudinary.config({
    cloud_name: Bun.env.CLOUDINARY_NAME!,
    api_key: Bun.env.CLOUDINARY_API_KEY!,
    api_secret: Bun.env.CLOUDINARY_API_SECRET!
})

// multer for profii picture
const profileStorage = multer.memoryStorage();
export const profileUpload = multer({ storage: profileStorage });

// multer for banner restaurant
const bannerStorage = multer.memoryStorage();
export const bannerUpload = multer({ storage: bannerStorage });

// multer for food picture
const foodStorage = multer.memoryStorage();
export const foodUpload = multer({ storage: foodStorage });

// for upload image
export async function uploadImage(file: Express.Multer.File | undefined, folder: string): Promise<string> {
    if (!file) {
        throw new CustomError(404, 'File is undefined');
    }
    const stream = Readable.from(file.buffer)
    const uploadResult = await new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream({
            folder: folder
        }, (error, result) => {
            if (error) {
                reject(error)
            }
            resolve(result)
        })
        stream.pipe(cloudStream)
    })
    return (uploadResult as any).secure_url
}

// for delete image
export async function deleteImage(url: string, folder: string): Promise<void> {
    const public_id = url.split('/').pop()?.split('.')[0]
    if (public_id) {
        await cloudinary.uploader.destroy(`${folder}/${public_id}`)
    }
}