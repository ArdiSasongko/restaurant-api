import { CustomError } from "../utils/customError";
import express from 'express'
import { Utils } from "../utils/utils";

export class Middleware {
    private static async validToken(token: string | undefined): Promise<string> {
        if (!token || !token.startsWith('Bearer ')) {
            throw new CustomError(401, "Access denied, no token provided or incorrect format");
        }

        const validToken: string = token.split(' ')[1];
        if (!validToken) {
            throw new CustomError(401, "Access denied, no token provided");
        }

        return validToken;
    }

    static async auth(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const authHeader = req.headers['authorization']
            const token = await Middleware.validToken(authHeader)
            const decode = await Utils.decodeJWT(token)
            if (!decode) {
                throw new CustomError(400, 'Invalid token')
            }

            // casting req as any
            (req as any).user = decode
            next()
        } catch (error: any) {
            next(error)
        }
    }
}