import { CustomError } from "../utils/customError";
import express from 'express'
import { Utils } from "../utils/utils";
import { restaurantModel } from "../model/restaurantModel";

export class Middleware {
    private static async validToken(token: string | undefined): Promise<string> {
        if (!token || !token.startsWith('Bearer ')) throw new CustomError(401, "Access denied, no token provided or incorrect format");

        const validToken: string = token.split(' ')[1];
        if (!validToken) throw new CustomError(401, "Access denied, no token provided");

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

    static async access(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const restaurant_id = req.params.restaurant_id
            const owner_id = (req as any).user.id

            // find the owner of the restaurant
            const result = await restaurantModel.findOne({ _id: restaurant_id, owner_id: owner_id })

            if (!result) throw new CustomError(401, 'Access denied, you are not the owner of this restaurant')

            next()
        } catch (error) {
            next(error)
        }
    }

    static async roleAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const role = (req as any).user.role
            console.log(role);

            // check role
            if (role !== 'seller' && role !== 'admin') throw new CustomError(400, 'Access denied, you are not authorized')

            next()
        } catch (error) {
            next(error)
        }
    }
}