import jwt from 'jsonwebtoken';
import { CustomError } from './customError';
import { Redis } from './redis';

// interface for refresh token
interface JWTPayload {
    id: string;
    email: string;
    username: string;
    is_verified: boolean;
    role: string;
}

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
            expiresIn: '15m',
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

    static async signJWTRefresh(payload: any): Promise<string> {
        const sign = Bun.env.JWT_SIGN_REFRESH!
        const expiredOption: jwt.SignOptions = {
            expiresIn: '30d',
        }

        const token = await jwt.sign(payload, sign, expiredOption)
        await Redis.setRefreshToken(payload.id, token)
        return token
    }

    static async decodeJWTRefresh(token: string) {
        try {
            const secret = Bun.env.JWT_SIGN_REFRESH!
            if (!secret) {
                throw new CustomError(500, "Internal server error: JWT secret not defined");
            }
            const decoded = await new Promise<JWTPayload>((resolve, reject) => {
                jwt.verify(token, secret, (err, decodedToken) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decodedToken as JWTPayload);
                    }
                });
            });

            // verification
            const storedToken = await Redis.getRefreshToken(decoded.id)

            if (storedToken !== token) throw new CustomError(400, 'Your Session is Expired!, please login again')

            return decoded;
        } catch (error: any) {
            throw new CustomError(400, error.message)
        }
    }
}