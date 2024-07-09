import { parse } from "date-fns";
import moment from "moment";
import mongoose, { model } from "mongoose";

const restaurantSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    banner: {
        type: String,
        required: false,
    },
    open_time: {
        type: String,
        required: true,
    },
    close_time: {
        type: String,
        required: true,
    },
    menus: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'menus',
        required: true,
    }],
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

restaurantSchema.pre('save', function (next) {
    const now = moment.tz('Asia/Jakarta').toDate()
    this.updated_at = now
    if (!this.created_at) {
        this.created_at = now
    }
    next()
})

restaurantSchema.pre

export const restaurantModel = model('restaurants', restaurantSchema)