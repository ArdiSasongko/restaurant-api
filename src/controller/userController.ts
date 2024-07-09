import express from 'express';
import { UserService } from '../service/userService';
import { v2 as cloudinary } from 'cloudinary';
import { ZodError } from "zod";
import { CustomError, formatZodError } from '../utils/customError';
import { userModel } from '../model/userModel';

export class UserController {
    static async registerUser(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const role = req.query.role as string || 'buyer'
        const file = req.file
        try {
            const defaultImg = Bun.env.DEFAULT_IMG!
            // Register user
            const newUser = await UserService.registerUser(data, file, defaultImg, role)
            res.status(201).json({
                status: 'success',
                message: 'User registered successfully, and token already send to your email',
                data: newUser
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

    static async resendToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        const email = (req as any).user.email
        try {
            const resend = await UserService.resendToken(email)

            if (!resend) {
                throw new CustomError(400, "failed to resend TOKEN")
            } else {
                res.status(200).json({
                    status_code: 200,
                    message: 'Success to resend TOKEN, please check your email'
                })
            }
        } catch (error) {
            next(error)
        }
    }

    static async emailVerified(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const email = (req as any).user.email
        try {
            const verified = await UserService.verifiedEmail(data, email)

            if (!verified) {
                throw new CustomError(400, "failed for verified your email, please try again")
            } else {
                res.status(200).json({
                    status_code: 200,
                    message: 'Success for verified your email'
                })
            }
        } catch (error) {
            next(error)
        }
    }

    static async login(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        try {
            const login = await UserService.login(data)
            if (!login) {
                throw new CustomError(400, 'Failed to login, please try again')
            }
            res.status(200).json({
                status_code: 200,
                message: 'login success',
                data: login
            })
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            next(error);
        }
    }

    static async forgetPassword(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        try {
            await UserService.forgetPassword(data)
            res.status(200).json({
                status_code: 200,
                message: 'Success to send TOKEN, please check your email'
            })
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            next(error)
        }
    }

    static async resetPassword(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        try {
            const reset = await UserService.resetPassword(data)

            if (!reset) {
                throw new CustomError(400, "failed to reset your password, please try again")
            } else {
                res.status(200).json({
                    status_code: 200,
                    message: 'Success for reset your password'
                })
            }

        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            next(error)
        }
    }

    static async profile(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = (req as any).user.id
        try {
            const profile = await userModel.findById(id).select('name email username picture role')

            if (!profile) {
                throw new CustomError(400, "failed to get profile")
            } else {
                res.status(200).json({
                    status_code: 200,
                    message: 'Success to get profile',
                    data: profile
                })
            }
        } catch (error) {
            next(error)
        }
    }

    static async updateProfile(req: express.Request, res: express.Response, next: express.NextFunction) {
        const data = req.body
        const id = (req as any).user.id
        const file = req.file
        try {
            const updateProfile = await UserService.updateProfile(data, id, file)
            if (!updateProfile) {
                throw new CustomError(400, "failed to update profile")
            }

            res.status(200).json({
                status_code: 200,
                message: 'Success to update profile',
                data: updateProfile
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
}