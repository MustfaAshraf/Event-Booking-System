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

const eventFields = {
    title: Joi.string().trim().min(3).max(120),
    description: Joi.string().trim().min(10).max(5000),
    category: Joi.string().trim().min(2).max(80),
    location: Joi.string().trim().min(2).max(200),
    startDate: Joi.date().iso().greater('now'),
    capacity: Joi.number().integer().min(1),
    price: Joi.number().min(0),
    status: Joi.string().valid('draft', 'published')
};

export const createEventSchema = Joi.object({
    ...eventFields,
    title: eventFields.title.required(),
    description: eventFields.description.required(),
    category: eventFields.category.required(),
    location: eventFields.location.required(),
    startDate: eventFields.startDate.required(),
    capacity: eventFields.capacity.required(),
    price: eventFields.price.required(),
    status: Joi.string().valid('draft', 'published').optional()
});

export const updateEventSchema = Joi.object({
    ...eventFields,
    status: Joi.string().valid('draft', 'published')
}).min(1);

export const eventIdSchema = Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});