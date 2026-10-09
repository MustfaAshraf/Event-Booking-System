import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { HTTP_STATUS } from '../../config/constants.js';
import { createUnauthorizedError } from '../../utils/appError.js';
import { sendSuccessResponse } from '../../utils/appResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as bookingService from './booking.service.js';

type EventParams = { id: string };
type BookingParams = { id: string };
type CreateBookingInput = { seats: number };

const createBookingHandler: RequestHandler<
    EventParams,
    unknown,
    CreateBookingInput
> = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError());
    }

    const booking = await bookingService.createBookingService(
        req.params.id,
        req.user._id.toString(),
        req.body.seats,
        {
            email: req.user.email,
            name: req.user.name
        }
    );
    sendSuccessResponse(res, { booking }, HTTP_STATUS.CREATED);
};

export const createBooking = asyncHandler(createBookingHandler);

const getMyBookingsHandler: RequestHandler = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError());
    }

    const bookings = await bookingService.getMyBookingsService(
        req.user._id.toString()
    );
    sendSuccessResponse(res, { bookings });
};

export const getMyBookings = asyncHandler(getMyBookingsHandler);

const cancelBookingHandler: RequestHandler<
    BookingParams,
    unknown,
    ParamsDictionary
> = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError());
    }

    const booking = await bookingService.cancelBookingService(
        req.params.id,
        req.user._id.toString()
    );
    sendSuccessResponse(res, { booking });
};

export const cancelBooking = asyncHandler(cancelBookingHandler);
