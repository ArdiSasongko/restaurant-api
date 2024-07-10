import moment from "moment";
import mongoose, { model } from "mongoose";

const orderSchema = new mongoose.Schema({
    restaurant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurants'
    },
    menu_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menus'
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    quantity: {
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['waiting', 'canceled', 'confirmed', 'delivered', 'finished'],
        required: true,
        default: 'waiting'
    },
    order_at: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    },
    updated_at: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    }
})

export const orderModel = model('orders', orderSchema)