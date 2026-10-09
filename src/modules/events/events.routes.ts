import { Router } from 'express';
import {
    optionalAuth,
    protect,
    restrictTo
} from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { USER_ROLES } from '../../config/constants.js';
import * as bookingController from '../bookings/booking.controller.js';
import { createBookingSchema } from '../bookings/booking.validations.js';
import * as eventsController from './events.controller.js';
import {
    createEventSchema,
    eventIdSchema,
    listEventsSchema,
    updateEventSchema
} from './events.validations.js';

const router = Router();

router.post(
    '/',
    protect,
    restrictTo(USER_ROLES.ORGANIZER, USER_ROLES.ADMIN),
    validate(createEventSchema, 'body'),
    eventsController.createEvent
);
router.get(
    '/',
    optionalAuth,
    validate(listEventsSchema, 'query'),
    eventsController.listEvents
);
router.get(
    '/:id/bookings',
    protect,
    validate(eventIdSchema, 'params'),
    eventsController.getEventBookings
);
router.post(
    '/:id/bookings',
    protect,
    restrictTo(USER_ROLES.USER),
    validate(eventIdSchema, 'params'),
    validate(createBookingSchema, 'body'),
    bookingController.createBooking
);
router.patch(
    '/:id',
    protect,
    restrictTo(USER_ROLES.ORGANIZER, USER_ROLES.ADMIN),
    validate(eventIdSchema, 'params'),
    validate(updateEventSchema, 'body'),
    eventsController.updateEvent
);
router.delete(
    '/:id',
    protect,
    restrictTo(USER_ROLES.ORGANIZER, USER_ROLES.ADMIN),
    validate(eventIdSchema, 'params'),
    eventsController.deleteEvent
);
router.get(
    '/:id',
    optionalAuth,
    validate(eventIdSchema, 'params'),
    eventsController.getEvent
);

export default router;