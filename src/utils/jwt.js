import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { createUnauthorizedError } from './appError.js';

export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.JWT.SECRET, {
        expiresIn: config.JWT.ACCESS_EXPIRE
    });
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.JWT.SECRET, {
        expiresIn: config.JWT.REFRESH_EXPIRE
    })
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.JWT.SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw createUnauthorizedError('Token has expired. Please log in again.');
        }
        if (error.name === 'JsonWebTokenError') {
            throw createUnauthorizedError('Invalid token. Please log in again.');
        }
        throw createUnauthorizedError('Token verification failed');
    }
};