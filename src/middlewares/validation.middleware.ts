import type { RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { createUnprocessableEntityError } from '../utils/appError.js';

type ValidationSource = 'all' | 'body' | 'params' | 'query';

export const validate = (
    schema: ObjectSchema,
    source: ValidationSource = 'all'
): RequestHandler => {
    return (req, res, next) => {
        const value = source === 'body'
            ? req.body
            : source === 'params'
                ? req.params
                : source === 'query'
                    ? req.query
                    : { ...req.body, ...req.params, ...req.query };
        const { error } = schema.validate(value, { abortEarly: false });

        if (error) {
            const errorMessages = error.details.map(err => err.message).join(', ');
            return next(createUnprocessableEntityError(`Validation failed: ${errorMessages}`));
        }
        next();
    };
};