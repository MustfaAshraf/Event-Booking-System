import { HTTP_STATUS } from '../config/constants.js';
import { config } from '../config/env.js';

export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    err.status = err.status || 'error';

    const response = {
        status: err.status,
        message: err.message,
    };

    if (config.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
};