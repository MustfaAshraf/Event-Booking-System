import { Router } from 'express';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { USER_ROLES } from '../../config/constants.js';
import * as bookingController from './booking.controller.js';
import {
    bookingIdSchema,
    createBookingSchema
} from './booking.validations.js';

const router = Router();

router.get(
    '/me',
    protect,
    restrictTo(USER_ROLES.USER),
    bookingController.getMyBookings
);
router.patch(
    '/:id/cancel',
    protect,
    restrictTo(USER_ROLES.USER),
    validate(bookingIdSchema, 'params'),
    bookingController.cancelBooking
);

export default router;
