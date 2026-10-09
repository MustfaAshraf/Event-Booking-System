import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import * as authService from './auth.service.js';
import type { LoginCredentials, RegisterUserInput } from './auth.service.js';
import { sendSuccessResponse } from '../../utils/appResponse.js';
import { HTTP_STATUS } from '../../config/constants.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { config } from '../../config/env.js';
import { createUnauthorizedError } from '../../utils/appError.js';

const setCookie = (res: Parameters<RequestHandler>[1], token: string): void => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const registerHandler: RequestHandler<ParamsDictionary, unknown, RegisterUserInput> =
    async (req, res, next) => {
        const user = await authService.registerUserService(req.body);
        sendSuccessResponse(res, { user }, HTTP_STATUS.CREATED);
    };

export const register = asyncHandler(registerHandler);

const loginHandler: RequestHandler<ParamsDictionary, unknown, LoginCredentials> =
    async (req, res) => {
        const { email, password } = req.body;
        const { user, accessToken, refreshToken } =
            await authService.loginUserService({ email, password });

        setCookie(res, refreshToken);
        sendSuccessResponse(res, { user, accessToken }, HTTP_STATUS.OK);
    };

export const login = asyncHandler(loginHandler);

const logoutHandler: RequestHandler = async (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    const { refreshToken } = req.cookies ?? {};

    if (typeof refreshToken === 'string') {
        await authService.logoutUserService(req.user._id.toString(), refreshToken);
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
    sendSuccessResponse(
        res,
        { message: 'Logged out successfully from this device' },
        HTTP_STATUS.OK
    );
};

export const logout = asyncHandler(logoutHandler);

const refreshHandler: RequestHandler = async (req, res, next) => {
    const { refreshToken } = req.cookies ?? {};

    if (typeof refreshToken !== 'string') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            status: 'fail',
            message: 'No refresh token provided.'
        });
    }

    const { newAccessToken, newRefreshToken } =
        await authService.refreshTokenService(refreshToken);

    setCookie(res, newRefreshToken);
    sendSuccessResponse(res, { accessToken: newAccessToken }, HTTP_STATUS.OK);
};

export const refresh = asyncHandler(refreshHandler);

const getMeHandler: RequestHandler = (req, res, next) => {
    if (!req.user) {
        return next(createUnauthorizedError('You are not logged in. Please log in to get access.'));
    }

    const { password: _password, refreshToken: _refreshTokens, ...safeUser } =
        req.user.toObject();

    sendSuccessResponse(res, { user: safeUser }, HTTP_STATUS.OK);
};

export const getMe = asyncHandler(getMeHandler);