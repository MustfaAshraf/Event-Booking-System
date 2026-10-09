import type { RequestHandler } from 'express';
import type { ObjectSchema } from 'joi';
import { createUnprocessableEntityError } from '../utils/appError.js';

export const validate = (schema: ObjectSchema): RequestHandler => {
    return (req, res, next) => {
        const { error } = schema.validate(
            { ...req.body, ...req.params, ...req.query },
            { abortEarly: false }
        );

        if (error) {
            const errorMessages = error.details.map(err => err.message).join(', ');
            return next(createUnprocessableEntityError(`Validation failed: ${errorMessages}`));
        }
        next();
    };
};