import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';
import { createUnauthorizedError } from './appError.js';

export type AuthTokenPayload = {
    id: string,
    email: string,
    role: string
}

const signOptions = (expiresIn: string): SignOptions => ({
    expiresIn: expiresIn as SignOptions['expiresIn']
});

export const generateAccessToken = (payload: AuthTokenPayload): string => {
    return jwt.sign(payload, config.JWT.SECRET, signOptions(config.JWT.ACCESS_EXPIRE));
};

export const generateRefreshToken = (payload: AuthTokenPayload): string => {
    return jwt.sign(payload, config.JWT.SECRET, signOptions(config.JWT.REFRESH_EXPIRE))
};

export const verifyToken = (token: string): AuthTokenPayload => {
    let decoded: string | jwt.JwtPayload;

    try {
        decoded = jwt.verify(token, config.JWT.SECRET);
    } catch (error: unknown) {
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            throw createUnauthorizedError('Token has expired. Please log in again.');
        }
        if (error instanceof Error && error.name === 'JsonWebTokenError') {
            throw createUnauthorizedError('Invalid token. Please log in again.');
        }
        throw createUnauthorizedError('Token verification failed');
    }

    if (
        typeof decoded === 'string' ||
        typeof decoded.id !== 'string' ||
        typeof decoded.email !== 'string' ||
        typeof decoded.role !== 'string'
    ) {
        throw createUnauthorizedError('Invalid token. Please log in again.');
    }

    return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
    };
};