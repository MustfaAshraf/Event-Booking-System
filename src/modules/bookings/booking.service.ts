import Booking from '../../DB/models/booking.model.js';
import Event from '../../DB/models/event.model.js';
import { BOOKING_STATUS, EVENT_STATUS } from '../../config/constants.js';
import {
    createBadRequestError,
    createConflictError,
    createNotFoundError
} from '../../utils/appError.js';
import { sendBookingConfirmationEmail } from '../../utils/emailLogger.js';

export type UserInfo = {
    email: string;
    name: string;
};

export const createBookingService = async (
    eventId: string,
    userId: string,
    seats: number,
    userInfo?: UserInfo
) => {
    const event = await Event.findOneAndUpdate(
        {
            _id: eventId,
            status: EVENT_STATUS.PUBLISHED,
            startDate: { $gt: new Date() },
            $expr: {
                $lte: [{ $add: ['$bookedSeats', seats] }, '$capacity']
            }
        },
        { $inc: { bookedSeats: seats } },
        { new: true }
    );

    if (!event) {
        const existingEvent = await Event.findById(eventId).lean().exec();
        if (!existingEvent) {
            throw createNotFoundError('Event not found.');
        }
        if (existingEvent.status !== EVENT_STATUS.PUBLISHED) {
            throw createBadRequestError('Only published events can be booked.');
        }
        if (existingEvent.startDate <= new Date()) {
            throw createBadRequestError('Past events cannot be booked.');
        }
        throw createConflictError('There are not enough seats available.');
    }

    try {
        const booking = await Booking.create({
            user: userId,
            event: eventId,
            seats,
            totalPrice: event.price * seats
        });

        if (userInfo?.email && userInfo?.name) {
            sendBookingConfirmationEmail({
                userEmail: userInfo.email,
                userName: userInfo.name,
                eventTitle: event.title,
                seats,
                totalPrice: booking.totalPrice,
                bookingId: booking._id.toString()
            });
        }

        return booking;
    } catch (error: unknown) {
        const rollback = await Event.updateOne(
            { _id: eventId, bookedSeats: { $gte: seats } },
            { $inc: { bookedSeats: -seats } }
        ).exec();
        if (rollback.modifiedCount !== 1) {
            throw createConflictError(
                'Booking could not be saved and the reserved seats could not be released.'
            );
        }

        if (
            typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === 11000
        ) {
            throw createConflictError(
                'You already have an active booking for this event.'
            );
        }

        throw error;
    }
};

export const getMyBookingsService = async (userId: string) =>
    Booking.find({ user: userId })
        .populate('event', 'title category location startDate status')
        .sort('-createdAt')
        .lean()
        .exec();

export const cancelBookingService = async (
    bookingId: string,
    userId: string
) => {
    const booking = await Booking.findOne({
        _id: bookingId,
        user: userId,
        status: BOOKING_STATUS.ACTIVE
    });
    if (!booking) {
        const ownedBooking = await Booking.exists({
            _id: bookingId,
            user: userId
        });
        if (!ownedBooking) {
            throw createNotFoundError('Booking not found.');
        }
        throw createConflictError('This booking is already cancelled.');
    }

    const event = await Event.findOne({
        _id: booking.event,
        startDate: { $gt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
    }).lean().exec();
    if (!event) {
        throw createBadRequestError(
            'Bookings can only be cancelled at least 24 hours before the event.'
        );
    }

    const cancelledBooking = await Booking.findOneAndUpdate(
        {
            _id: bookingId,
            user: userId,
            status: BOOKING_STATUS.ACTIVE
        },
        { $set: { status: BOOKING_STATUS.CANCELLED } },
        { new: true }
    );
    if (!cancelledBooking) {
        throw createConflictError('This booking has already been cancelled.');
    }

    const seatUpdate = await Event.updateOne(
        { _id: booking.event, bookedSeats: { $gte: booking.seats } },
        { $inc: { bookedSeats: -booking.seats } }
    ).exec();
    if (seatUpdate.modifiedCount !== 1) {
        throw createConflictError(
            'The booking was cancelled, but event seat counts could not be updated.'
        );
    }

    return cancelledBooking;
};
