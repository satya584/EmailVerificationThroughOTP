const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userOtpVerificationSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        required: true
    },
    expireAt: {
        type: Date,
        required: true
    }
})

const UserOtpVerification = mongoose.model('UserOtpVerification', userOtpVerificationSchema);
module.exports = UserOtpVerification;