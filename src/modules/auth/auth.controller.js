import * as authService from './auth.service.js';
import { sendSuccessResponse } from '../../utils/appResponse.js';
import { HTTP_STATUS } from '../../config/constants.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { config } from '../../config/env.js';

const setCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

export const register = asyncHandler(async (req, res, next) => {
    const user = await authService.registerUserService(req.body);
    sendSuccessResponse(res, { user }, HTTP_STATUS.CREATED);
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUserService(email, password);

    setCookie(res, refreshToken);

    sendSuccessResponse(res, { user, accessToken }, HTTP_STATUS.OK);
});

export const logout = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
        await authService.logoutUserService(req.user._id, refreshToken);
    }

    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

    sendSuccessResponse(res, { message: 'Logged out successfully from this device' }, HTTP_STATUS.OK);
});

export const refresh = asyncHandler(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ status: 'fail', message: 'No refresh token provided.' });
    }

    const { newAccessToken, newRefreshToken } = await authService.refreshTokenService(refreshToken);

    setCookie(res, newRefreshToken);

    sendSuccessResponse(res, { accessToken: newAccessToken }, HTTP_STATUS.OK);
});

export const getMe = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    sendSuccessResponse(res, { user: userObj }, HTTP_STATUS.OK);
});