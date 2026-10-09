import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccessResponse } from '../../utils/appResponse.js';
import * as eventsService from './events.service.js';
import type { EventListQuery } from './events.service.js';

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