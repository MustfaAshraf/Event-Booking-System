import Joi from 'joi';

export const bookingIdSchema = Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export const createBookingSchema = Joi.object({
    seats: Joi.number().integer().min(1).max(5).required()
});
