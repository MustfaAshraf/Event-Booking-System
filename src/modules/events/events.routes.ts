import { Router } from 'express';
import { optionalAuth } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import * as eventsController from './events.controller.js';
import { listEventsSchema } from './events.validations.js';

const router = Router();

router.get(
    '/',
    optionalAuth,
    validate(listEventsSchema),
    eventsController.listEvents
);

export default router;