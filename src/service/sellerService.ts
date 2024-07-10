import moment from "moment-timezone";
import { orderModel } from "../model/orderModel";
import { CustomError } from "../utils/customError";
import { historyModel } from "../model/historyModel";

export class SellerService {
    static async confirmOrder(order_id: string, restaurant_id: string) {
        try {
            const order = await orderModel.findOne({ _id: order_id, restaurant_id: restaurant_id })

            // check if order exists
            if (!order) throw new CustomError(404, 'Order not found')

            // check status order
            if (['confirmed', 'delivered', 'finished', 'canceled'].includes(order.status)) {
                throw new CustomError(400, `Order can't be confirmed, order already ${order.status}`);
            }

            // confirm order
            const confirm = await orderModel.findOneAndUpdate({ _id: order_id, restaurant_id: restaurant_id },
                {
                    status: 'confirmed',
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                }
            )

            // create history
            const history = await historyModel.findOne({ order_id: order_id })

            if (!history) {
                await historyModel.create({ user_id: order.user_id, order_id: order_id, status: 'waited' })
            }
            if (!confirm) throw new CustomError(400, 'failed for confirm order')

            return confirm
        } catch (error) {
            throw error
        }
    }

    static async deliverOrder(order_id: string, restaurant_id: string) {
        try {
            const order = await orderModel.findOne({ _id: order_id, restaurant_id: restaurant_id })

            // check if order exists
            if (!order) throw new CustomError(404, 'Order not found')

            // check status order
            if (['canceled', 'delivered', 'finished'].includes(order.status)) {
                throw new CustomError(400, `Order can't be delivered, order already ${order.status}`);
            }

            // confirm order
            const confirm = await orderModel.findOneAndUpdate({ _id: order_id, restaurant_id: restaurant_id },
                {
                    status: 'delivered',
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                }
            )

            if (!confirm) throw new CustomError(400, 'failed for confirm order')

            return confirm
        } catch (error) {
            throw error
        }
    }

    static async cancelOrder(order_id: string, restaurant_id: string) {
        try {
            const order = await orderModel.findOne({ _id: order_id, restaurant_id: restaurant_id })

            // check if order exists
            if (!order) throw new CustomError(404, 'Order not found')

            // check status order
            if (['confirmed', 'delivered', 'finished', 'canceled'].includes(order.status)) {
                throw new CustomError(400, `Order can't be canceled, order already ${order.status}`);
            }

            // confirm order
            const confirm = await orderModel.findOneAndUpdate({ _id: order_id, restaurant_id: restaurant_id },
                {
                    status: 'canceled',
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                }
            )

            if (!confirm) throw new CustomError(400, 'failed for confirm order')

            return confirm
        } catch (error) {
            throw error
        }
    }
}