import { ZodError } from "zod";
import { menuModel } from "../model/menuModel";
import { orderModel } from "../model/orderModel";
import { restaurantModel } from "../model/restaurantModel";
import { CustomError, formatZodError } from "../utils/customError";
import { BuyerValidator } from "../validator/buyerValidator";
import { historyModel } from "../model/historyModel";
import moment from "moment-timezone";

export class BuyerService {
    static async createOrder(data: any, restaurant_id: string, menu_id: string, user_id: string) {
        try {
            const request = await BuyerValidator.create.parseAsync(data)

            // check if restaurant exist
            const restaurant = await restaurantModel.findById(restaurant_id)

            if (!restaurant) throw new CustomError(404, 'Restaurant not found')

            // check if menu exist
            const menu = await menuModel.findById(menu_id)

            if (!menu) throw new CustomError(404, 'Menu not found')

            // check if menu amount still available
            if (menu.amount === 0) throw new CustomError(404, `sorry ${menu.name} is empty`)

            // total price
            const total_price = menu.price * request.quantity

            // if total price not same with request total price
            if (total_price > request.total_price) {
                throw new CustomError(400, `sorry not enough money, total is ${total_price}`)
            }

            const change = request.total_price - total_price
            // create object for save information
            const newOrder = {
                restaurant_id: restaurant_id,
                menu_id: menu_id,
                user_id: user_id,
                quantity: request.quantity,
                total_price: total_price,
                status: 'waiting'
            }

            // save to database
            const saveOrder = await orderModel.create(newOrder)

            // update quantity in restaurant
            const newQuantity = menu.amount - request.quantity

            await menuModel.findByIdAndUpdate(menu_id, { amount: newQuantity })

            if (!saveOrder) throw new CustomError(400, 'failed for create order')

            const result = {
                saveOrder,
                change
            }

            return result
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedError = formatZodError(error)
                throw new CustomError(400, 'Validation Error', formattedError)
            }
            throw error
        }
    }

    static async cancelOrder(order_id: string, user_id: string) {
        try {
            // find order
            const order = await orderModel.findOne({ _id: order_id, user_id: user_id });

            if (!order) throw new CustomError(404, 'Order not found');

            // if status order at confirmed or delivered cannot be canceled
            if (['confirmed', 'delivered', 'finished'].includes(order.status)) {
                throw new CustomError(400, `Order can't be canceled, order already ${order.status}`);
            }

            // cancel order
            const cancelOrder = await orderModel.findOneAndUpdate(
                { _id: order_id, user_id: user_id },
                {
                    status: 'canceled',
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                },
                { new: true }
            );

            // create history for canceled order
            const history = await historyModel.findOne({ order_id: order_id });

            // if history not exist
            if (!history) {
                await historyModel.create({ user_id: user_id, order_id: order_id, status: 'canceled' });
            } else {
                await historyModel.findOneAndUpdate({ order_id: order_id }, { status: 'canceled' });
            }

            // if failed to cancel order
            if (!cancelOrder) {
                throw new CustomError(400, 'Failed to cancel order');
            }

            return cancelOrder;
        } catch (error: any) {
            throw error;
        }
    }

    static async confirmOrder(order_id: string, user_id: string) {
        try {
            const order = await orderModel.findOne({ _id: order_id, user_id: user_id })

            if (!order) throw new CustomError(404, 'Order not found')

            // if order already cancel
            if (order.status === 'canceled') throw new CustomError(400, 'Sorry, your order already cancel')

            const confirmed = await orderModel.findOneAndUpdate({ _id: order_id, user_id: user_id },
                {
                    status: 'finished',
                    updated_at: moment().tz('Asia/Jakarta', true).format()
                },
                { new: true }
            )

            // update the history
            await historyModel.findOneAndUpdate({ order_id: order_id }, { status: 'finished' })
            if (!confirmed) {
                throw new CustomError(400, 'failed for confirmed')
            }

            return true
        } catch (error) {
            throw error
        }
    }
}