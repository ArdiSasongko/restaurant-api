import moment from "moment";
import mongoose, { model, Schema } from "mongoose";

const menuSchema = new mongoose.Schema({
    restaurant_id: {
        type: Schema.Types.ObjectId,
        ref: 'restaurants',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    picture: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    amount: {
        type: Number,
        required: true,
    },
    created_at: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    },
    updated_at: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    },
})

menuSchema.pre('save', function (next) {
    const now = moment.tz('Asia/Jakarta').toDate()
    this.updated_at = now
    if (!this.created_at) {
        this.created_at = now
    }
    next()
})

export const menuModel = model('menus', menuSchema)