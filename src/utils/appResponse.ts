import { HTTP_STATUS } from '../config/constants.js';
import type { Response } from 'express';

export const sendSuccessResponse = (res: Response, data: unknown = null, statusCode: number = HTTP_STATUS.OK): Response => {
    return res.status(statusCode).json({
        status: 'success',
        data: data
    });
};

export const sendFailResponse = (res: Response, data: unknown, statusCode: number = HTTP_STATUS.BAD_REQUEST): Response => {
    return res.status(statusCode).json({
        status: 'fail',
        data: data
    });
};

export const sendErrorResponse = (res: Response, message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, code: string | null = null, data: unknown = null): Response => {
    const response: {
        status: 'error',
        message: string,
        code?: string,
        data?: unknown,
    } = {
        status: 'error',
        message: message
    };

    if (code) response.code = code;
    if (data) response.data = data;

    return res.status(statusCode).json(response);
};