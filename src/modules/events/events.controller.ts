import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccessResponse } from '../../utils/appResponse.js';
import { HTTP_STATUS } from '../../config/constants.js';
import { createUnauthorizedError } from '../../utils/appError.js';
import * as eventsService from './events.service.js';
import type {
    EventInput,
    EventListQuery,
    EventUpdates
} from './events.service.js';

const listEventsHandler: RequestHandler<
    ParamsDictionary,
    unknown,
    unknown
> = async (req, res) => {
    const queryString: EventListQuery = {};

    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
            queryString[key] = value;
        }
    }

    const result = await eventsService.listEventsService(
        queryString,
        req.user?.role
    );

    sendSuccessResponse(res, result);
};

export const listEvents = asyncHandler(listEventsHandler);

type EventParams = { id: string };

const getEventHandler: RequestHandler<EventParams> = async (req, res) => {
    const event = await eventsService.getEventService(req.params.id, req.user?.role);
    sendSuccessResponse(res, { event });
};

export const getEvent = asyncHandler(getEventHandler);

const createEventHandler: RequestHandler<
    ParamsDictionary,
    unknown,
    EventInput
> = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError());
    }

    const event = await eventsService.createEventService(
        req.body,
        req.user._id.toString()
    );
    sendSuccessResponse(res, { event }, HTTP_STATUS.CREATED);
};

export const createEvent = asyncHandler(createEventHandler);

const updateEventHandler: RequestHandler<
    EventParams,
    unknown,
    EventUpdates
> = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError());
    }

    const event = await eventsService.updateEventService(
        req.params.id,
        req.body,
        req.user._id.toString(),
        req.user.role
    );
    sendSuccessResponse(res, { event });
};

export const updateEvent = asyncHandler(updateEventHandler);

const deleteEventHandler: RequestHandler<EventParams> = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError());
    }

    const result = await eventsService.deleteEventService(
        req.params.id,
        req.user._id.toString(),
        req.user.role
    );
    sendSuccessResponse(res, result);
};

export const deleteEvent = asyncHandler(deleteEventHandler);

const getEventBookingsHandler: RequestHandler<EventParams> =
    async (req, res, next) => {
        if (!req.user) {
            return next(createUnauthorizedError());
        }

        const bookings = await eventsService.getEventBookingsService(
            req.params.id,
            req.user._id.toString(),
            req.user.role
        );
        sendSuccessResponse(res, { bookings });
    };

export const getEventBookings = asyncHandler(getEventBookingsHandler);