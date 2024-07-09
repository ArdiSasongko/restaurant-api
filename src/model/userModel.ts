import moment from "moment-timezone";
import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    reset_token: {
        type: String,
        required: false,
    },
    reset_token_expired: {
        type: Date,
        required: false,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    },
    picture: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: true,
        enum: ['buyer', 'seller'],
        default: 'buyer',
    },
    token_verifications: {
        type: String,
        required: true,
    },
    token_verifications_expired: {
        type: Date,
        required: true,
        default: () => moment().tz('Asia/Jakarta', true).toDate()
    },
    is_verified: {
        type: Boolean,
        required: true,
        default: false
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

userSchema.pre('save', function (next) {
    const now = moment.tz('Asia/Jakarta').toDate()
    this.updated_at = now
    if (!this.created_at) {
        this.created_at = now
    }
    next()
})

export const userModel = model('users', userSchema)