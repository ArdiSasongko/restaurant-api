import { userModel } from "../model/userModel";
import { CustomError, formatZodError } from "../utils/customError";
import { userValidator } from "../validator/userValidator";
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { ZodError } from "zod";
import { Utils } from "../utils/utils";
import moment from "moment-timezone";
import { SendEmail } from "../utils/sendEmail";


export class UserService {
    static async registerUser(data: any, file: Express.Multer.File | undefined, image: string, role: string) {
        try {
            const request = await userValidator.register.parseAsync(data);

            // create random token for otp
            const token = Utils.generatedRandom()

            // check if username or email already exits
            const user = await userModel.findOne({ $or: [{ username: request.username }, { email: request.email }] });

            if (user) {
                throw new CustomError(409, 'Username or email already exists');
            }

            // hash password
            const hashPassword = await Bun.password.hash(request.password, {
                algorithm: 'bcrypt',
                cost: 10
            })

            // save image to cloudinary
            let imageUrl = image;

            if (file) {
                const stream = Readable.from(file.buffer)
                const uploadResult = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader.upload_stream({
                        folder: 'profile'
                    }, (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    })
                    stream.pipe(cloudStream)
                })
                imageUrl = (uploadResult as any).secure_url;
            }

            // create object for save information
            const newUser = {
                name: request.name,
                email: request.email,
                username: request.username,
                password: hashPassword,
                picture: imageUrl,
                role: role,
                token_verifications: token,
                token_verifications_expired: moment().tz('Asia/Jakarta', true).add(new Utils().MAX_TIME_TOKEN, 'milliseconds').toDate()
            }

            const saveUser = await userModel.create(newUser);

            if (!saveUser) {
                throw new CustomError(400, 'Failed to save user data')
            }

            // send token to email
            await SendEmail.sendEmail(
                {
                    email: saveUser.email,
                    subject: "Send TOKEN for verifications email",
                    otp: token,
                    date: saveUser.token_verifications_expired,
                }
            )
            return saveUser;
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }

    static async resendToken(email: string) {
        try {
            // Find email
            const findEmail = await userModel.findOne({ email })

            if (!findEmail) {
                throw new CustomError(404, "Email not found")
            }

            // check if email verified
            if (findEmail.is_verified === true) {
                throw new CustomError(400, "Email already verified")
            }

            // generate new token and expired time
            const token: string = Utils.generatedRandom()
            const expiredToken: Date = moment().tz('Asia/Jakarta', true).add(new Utils().MAX_TIME_TOKEN, 'milliseconds').toDate()

            // update and send token
            await userModel.findOneAndUpdate({ email },
                {
                    token_verifications: token,
                    token_verifications_expired: expiredToken,
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                }
            )

            await SendEmail.sendEmail({
                email: email,
                subject: 'Resend TOKEN for verifications',
                otp: token,
                date: expiredToken
            })

            return true
        } catch (error) {
            throw error
        }
    }

    static async verifiedEmail(token: string, email: string) {
        try {
            const request = await userValidator.token.parseAsync(token)

            // check email if verified
            const validEmail = await userModel.findOne(
                {
                    email: email,
                    is_verified: true
                }
            )

            if (validEmail) {
                throw new CustomError(400, "Email already verified, thanks")
            }

            const user = await userModel.findOneAndUpdate({
                email: email,
                token_verifications: request.token,
                token_verifications_expired: { $gt: Date.now() }
            }, {
                is_verified: true,
                token_verifications: null,
                token_verifications_expired: null,
                updated_at: moment().tz('Asia/Jakarta', true).format()
            })

            if (!user) {
                return false
            }
            return true
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }

    static async login(data: any) {
        try {
            const request = await userValidator.login.parseAsync(data)

            if (!request.username && !request.email) {
                throw new CustomError(404, "Please fill username or email for login");
            }

            let user;

            // if using username
            if (request.username) {
                user = await userModel.findOne({ username: request.username });
            }

            // if using email
            if (!user && request.email) {
                user = await userModel.findOne({ email: request.email });
            }

            if (!user) {
                throw new CustomError(404, "user not found")
            }

            // check password if not match
            const isMatch = await Bun.password.verify(request.password, user.password, 'bcrypt')

            if (!isMatch) {
                throw new CustomError(400, "Invalid Password, please try again")
            }

            const payload = {
                id: user._id,
                email: user.email,
                username: user.username,
                is_verified: user.is_verified,
                role: user.role
            }

            const token = await Utils.signJWT(payload)

            if (!token) {
                throw new CustomError(400, "Failed to generated token")
            }

            return token
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }

    static async forgetPassword(data: any) {
        try {
            const request = await userValidator.forgetPassword.parseAsync(data)

            // check email if not found
            const user = await userModel.findOne({ email: request.email })

            if (!user) {
                throw new CustomError(404, "Email not found")
            }

            // create random token for otp
            const token = Utils.generatedRandom()
            const tokenExpired = moment().tz('Asia/Jakarta', true).add(new Utils().MAX_TIME_TOKEN, 'milliseconds').toDate()

            // update token and expired time
            const sendToken = await userModel.findOneAndUpdate(
                { email: request.email },
                {
                    reset_token: token,
                    reset_token_expired: tokenExpired,
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                },
                { new: true }
            )

            if (!sendToken) {
                throw new CustomError(400, "Failed to create token")
            } else {
                await SendEmail.sendEmail({
                    email: request.email,
                    subject: "Send TOKEN for reset password",
                    otp: token,
                    date: tokenExpired
                })

                return true
            }
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }

    static async resetPassword(data: any) {
        try {
            const request = await userValidator.resetPassword.parseAsync(data)

            // check email if not found
            const user = await userModel.findOne({
                email: request.email,
                reset_token: request.token,
                reset_token_expired: { $gt: Date.now() }
            })

            if (!user) {
                throw new CustomError(400, "user not found or token expired")
            }

            // check if password not match
            if (request.new_password !== request.valid_password) {
                throw new CustomError(400, "Password not match")
            }

            // hash password
            const hashPassword = await Bun.password.hash(request.new_password, {
                algorithm: 'bcrypt',
                cost: 10
            })

            // update password
            const updatePassword = await userModel.findOneAndUpdate(
                {
                    email: request.email,
                    reset_token: request.token,
                    reset_token_expired: { $gt: Date.now() }
                },
                {
                    password: hashPassword,
                    reset_token: null,
                    reset_token_expired: null,
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                }
            )

            if (!updatePassword) {
                throw new CustomError(400, "Failed to update password")
            }

            return true
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }

    static async updateProfile(data: any, id: string, file: Express.Multer.File | undefined) {
        try {
            const request = await userValidator.updateProfile.parseAsync(data)

            // find user by id
            const user = await userModel.findById(id)

            if (!user) {
                throw new CustomError(404, "User not found")
            }

            // check if username already exits
            const checkUsername = await userModel.findOne({ username: request.username })

            if (checkUsername) {
                throw new CustomError(409, "Username already exits")
            }

            // check if not update username
            if (!request.username) {
                request.username = user.username
            }

            let imageUrl = user.picture

            // check if update image
            if (file) {
                const stream = Readable.from(file.buffer)
                const uploadResult = await new Promise((resolve, reject) => {
                    const cloudStream = cloudinary.uploader.upload_stream({
                        folder: 'profile'
                    }, (error, result) => {
                        if (error) reject(error);
                        resolve(result);
                    })
                    stream.pipe(cloudStream)
                })
                imageUrl = (uploadResult as any).secure_url;

                // delete old image
                if (user.picture) {
                    const public_id = user.picture.split('/').pop()?.split('.')[0] // get image public_id from cloudinary
                    if (public_id) {
                        await cloudinary.uploader.destroy(`profile/${public_id}`)
                    }
                }
            }

            // update profile user
            const updateProfile = await userModel.findByIdAndUpdate(id, {
                username: request.username,
                picture: imageUrl,
                updated_at: moment().tz('Asia/Jakarta', true).format()
            },
                {
                    new: true
                }).select('name email username picture role')

            if (!updateProfile) {
                throw new CustomError(400, "Failed to update profile")
            }

            return updateProfile
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = formatZodError(error)
                throw new CustomError(400, "Validation Error", formattedErrors);
            }
            throw error;
        }
    }
}