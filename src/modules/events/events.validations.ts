import Joi from 'joi';
import { config } from '../../config/env.js';

export const listEventsSchema = Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(config.PAGINATION.MAX_PAGE_SIZE),
    keyword: Joi.string().trim().max(100),
    category: Joi.string().trim().max(80),
    startDateFrom: Joi.date().iso(),
    startDateTo: Joi.date().iso(),
    sort: Joi.string().valid(
        'startDate',
        '-startDate',
        'price',
        '-price'
    )
});