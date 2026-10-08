import { HTTP_STATUS } from '../config/constants.js';

export class AppError extends Error {
    constructor(message, statusCode, stack='') {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

export const createBadRequestError = (message = "Bad Request") => {
    return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

export const createUnauthorizedError = (message = "Unauthorized access. Please log in.") => {
    return new AppError(message, HTTP_STATUS.UNAUTHORIZED);
};

export const createForbiddenError = (message = "Access forbidden. You do not have permission.") => {
    return new AppError(message, HTTP_STATUS.FORBIDDEN);
};

export const createNotFoundError = (message = "Resource not found.") => {
    return new AppError(message, HTTP_STATUS.NOT_FOUND);
};

export const createConflictError = (message = "Resource already exists.") => {
    return new AppError(message, HTTP_STATUS.CONFLICT);
};

export const createUnprocessableEntityError = (message = "Validation failed. Check your input.") => {
    return new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
};

export const createTooManyRequestsError = (message = "Too many requests. Please try again later.") => {
    return new AppError(message, HTTP_STATUS.TOO_MANY_REQUESTS);
};

export const createInternalServerError = (message = "Internal Server Error.") => {
    return new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

export const createServiceUnavailableError = (message = "Service unavailable. Please try again later.") => {
    return new AppError(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
};