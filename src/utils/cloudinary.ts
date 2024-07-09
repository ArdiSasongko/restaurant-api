import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

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