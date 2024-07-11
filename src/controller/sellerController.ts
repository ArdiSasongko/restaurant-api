import express from 'express'
import { orderModel } from '../model/orderModel'
import { CustomError } from '../utils/customError'
import { SellerService } from '../service/sellerService'

export class SellerController {
    static async getOrders(req: express.Request, res: express.Response, next: express.NextFunction) {
        const restaurant_id = req.params.restaurant_id
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = parseInt(req.query.limit as string) || 5; // amount of fetch data
        const skip = (page - 1) * limit
        try {
            const result = await orderModel.find({ restaurant_id: restaurant_id }, { _id: 1, status: 1 })
                .skip(skip)
                .limit(limit)

            const total_data = await orderModel.countDocuments({ restaurant_id: restaurant_id })
            if (result.length === 0 && page === 1) throw new CustomError(404, 'Order not found')

            const total_pages = Math.ceil(total_data / limit)
            if (page > total_pages) throw new CustomError(400, `Page ${page} exceeds the total pages ${total_pages}`)

            res.status(200).json({
                status_code: 200,
                message: 'Orders found',
                data: result,
                pagination: {
                    current_page: page,
                    total_pages: total_pages,
                    total_items: total_data,
                    items_per_page: limit
                }
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