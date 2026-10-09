import mongoose from 'mongoose';
import { EVENT_STATUS } from '../../config/constants.js';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    bookedSeats: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: Object.values(EVENT_STATUS),
        default: EVENT_STATUS.DRAFT
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

eventSchema.index({ title: 'text' });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ status: 1 });

export default mongoose.model('Event', eventSchema);