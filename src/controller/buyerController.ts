import express from 'express'
import { orderModel } from '../model/orderModel'
import { CustomError } from '../utils/customError'
import { BuyerService } from '../service/buyerService'
import { historyModel } from '../model/historyModel'

export class BuyerController {
    static async getOrders(req: express.Request, res: express.Response, next: express.NextFunction) {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = parseInt(req.query.limit as string) || 5; // amount of fetch data
        const skip = (page - 1) * limit
        const id = req.user.id
        try {
            const result = await orderModel.find({ user_id: id }, { _id: 1, status: 1 })
                .skip(skip)
                .limit(limit)

            const total_data = await orderModel.countDocuments({ user_id: id })
            if (result.length === 0 && page === 1) throw new CustomError(404, 'sorry, you are not order yet')

            const total_pages = Math.ceil(total_data / limit)
            if (page > total_pages) throw new CustomError(400, `Page ${page} exceeds the total pages ${total_pages}`)

            res.status(200).json({
                status_code: 200,
                messge: 'Success get orders',
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
        const order_id = req.params.order_id
        const id = req.user.id
        try {
            const result = await orderModel.findOne({ _id: order_id, user_id: id })

            if (!result) throw new CustomError(404, 'order not found')

            res.status(200).json({
                status_code: 200,
                message: 'Success get order',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    static async canceledOrder(req: express.Request, res: express.Response, next: express.NextFunction) {
        const order_id = req.params.order_id
        const id = req.user.id
        try {
            const result = await BuyerService.cancelOrder(order_id, id)

            if (!result) throw new CustomError(400, 'failed for canceling order')

            res.status(200).json({
                status_code: 200,
                message: 'Success for canceling this order'
            })
        } catch (error) {
            next(error)
        }
    }

    static async confirmOrder(req: express.Request, res: express.Response, next: express.NextFunction) {
        const order_id = req.params.order_id
        const id = req.user.id
        try {
            await BuyerService.confirmOrder(order_id, id)

            res.status(200).json({
                status_code: 200,
                message: 'Success for confirmed this order'
            })
        } catch (error) {
            next(error)
        }
    }

    static async getHistories(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.user.id
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = parseInt(req.query.limit as string) || 5; // amount of fetch data
        const skip = (page - 1) * limit
        try {
            const result = await historyModel.find({ user_id: id }, { _id: 1, status: 1 })
                .skip(skip)
                .limit(limit)

            const total_data = await historyModel.countDocuments({ user_id: id })
            if (result.length === 0 && page === 1) throw new CustomError(404, 'histories not found')

            const total_pages = Math.ceil(total_data / limit)
            if (page > total_pages) throw new CustomError(400, `Page ${page} exceeds the total pages ${total_pages}`)

            res.status(200).json({
                status_code: 200,
                message: 'Success for get histories',
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

    static async getHistory(req: express.Request, res: express.Response, next: express.NextFunction) {
        const id = req.user.id
        const history_id = req.params.history_id

        try {
            const result = await historyModel.findOne({ _id: history_id, user_id: id }).populate('order_id')

            if (!result) throw new CustomError(404, 'History not found')

            res.status(200).json({
                status_code: 200,
                message: 'Success for get history',
                data: result
            })
        } catch (error) {
            next(error)
        }
    }
}