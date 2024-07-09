import jwt from 'jsonwebtoken';
import { CustomError } from './customError';

export class Utils {
    public MAX_TIME_TOKEN: number = 5 * 60 * 1000

    static generatedRandom(): string {
        let otp: string = ''
        for (let i: number = 0; i < 6; i++) {
            otp += Math.floor(Math.random() * 10) + 1
        }
        return otp
    }

    static async signJWT(payload: any): Promise<string> {
        const sign = Bun.env.JWT_SIGN!
        const expiredOption: jwt.SignOptions = {
            expiresIn: '1d',
        }

        const token = await jwt.sign(payload, sign, expiredOption)
        return token
    }

    static async decodeJWT(token: string) {
        try {
            const secret = Bun.env.JWT_SIGN!
            if (!secret) {
                throw new CustomError(500, "Internal server error: JWT secret not defined");
            }
            const decoded = await new Promise((resolve, reject) => {
                jwt.verify(token, secret, (err, decodedToken) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decodedToken);
                    }
                });
            });

            return decoded;
        } catch (error: any) {
            throw new CustomError(400, error.message)
        }
    }
}