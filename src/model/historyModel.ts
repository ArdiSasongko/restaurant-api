import moment from "moment";
import mongoose, { model } from "mongoose";

const historySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    },
    status: {
        type: String,
        enum: ['waited', 'canceled', 'finished'],
        required: true,
        default: 'waited'
    },
    created_at: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    },
})

export const historyModel = model('histories', historySchema)