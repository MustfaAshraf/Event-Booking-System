import type { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt.js';
import User from '../DB/models/user.model.js';
import { createUnauthorizedError, createForbiddenError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect: RequestHandler = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(createUnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    const decoded = verifyToken(token);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(createUnauthorizedError('The user belonging to this token does no longer exist.'));
    }

    req.user = currentUser;
    next();
});

export const restrictTo = (...roles: string[]): RequestHandler => {
    return (req, res, next) => {
        if (!req.user) {
            return next(createUnauthorizedError('You are not logged in. Please log in to get access.'));
        }
        if (!roles.includes(req.user.role)) {
            return next(createForbiddenError('You do not have permission to perform this action.'));
        }
        next();
    };
};