import { HTTP_STATUS } from '../config/constants.js';

export const sendSuccessResponse = (res, data = null, statusCode = HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        status: 'success',
        data: data
    });
};

export const sendFailResponse = (res, data, statusCode = HTTP_STATUS.BAD_REQUEST) => {
    return res.status(statusCode).json({
        status: 'fail',
        data: data
    });
};

export const sendErrorResponse = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = null, data = null) => {
    const response = {
        status: 'error',
        message: message
    };

    if (code) response.code = code;
    if (data) response.data = data;

    return res.status(statusCode).json(response);
};