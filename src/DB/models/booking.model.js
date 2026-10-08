import mongoose from 'mongoose';
import { BOOKING_STATUS } from '../../config/constants.js';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(BOOKING_STATUS),
        default: BOOKING_STATUS.ACTIVE
    }
}, { timestamps: true });

bookingSchema.index(
    { user: 1, event: 1 },
    { unique: true, partialFilterExpression: { status: BOOKING_STATUS.ACTIVE } }
);

export default mongoose.model('Booking', bookingSchema);