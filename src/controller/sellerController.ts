import express from 'express'
import { orderModel } from '../model/orderModel'
import { CustomError } from '../utils/customError'
import { SellerService } from '../service/sellerService'

export class SellerController {
    static async getOrders(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        try {
            const result = await orderModel.find({ restaurant_id: restaurant_id }, { _id: 1, status: 1 })

            if (!result) throw new CustomError(404, 'Order not found')

            res.status(200).json({
                status_code: 200,
                message: 'Orders found',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async getOrder(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const order_id = req.params.order_id
        try {
            const result = await orderModel.findOne({ restaurant_id: restaurant_id, _id: order_id })

            if (!result) throw new CustomError(404, 'Order not found')

            res.status(200).json({
                status_code: 200,
                message: 'Order found',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async confirmOrder(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const order_id = req.params.order_id
        try {
            const result = await SellerService.confirmOrder(order_id, restaurant_id)

            res.status(200).json({
                status_code: 200,
                message: `Success confirm order_id ${result._id}`
            })
        } catch (error) {
            next(error)
        }
    }

    static async deliveredOrder(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const order_id = req.params.order_id
        try {
            const result = await SellerService.deliverOrder(order_id, restaurant_id)

            res.status(200).json({
                status_code: 200,
                message: `Success delivered order_id ${result._id}`
            })
        } catch (error) {
            next(error)
        }
    }

    static async canceledOrder(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const order_id = req.params.order_id
        try {
            const result = await SellerService.cancelOrder(order_id, restaurant_id)

            res.status(200).json({
                status_code: 200,
                message: `Success cancel order_id ${result._id}`
            })
        } catch (error) {
            next(error)
        }
    }
}