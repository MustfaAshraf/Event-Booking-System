import dotenv from 'dotenv';
dotenv.config();

export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT) || 3000,
    API_PREFIX: process.env.API_PREFIX || '/api',

    MONGODB_URI: process.env.MONGODB_URI,

    JWT: {
        SECRET: process.env.JWT_SECRET || 'fallback_secret_key_for_dev',
        ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || '15m',
        REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
    },

    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 50,
    },

    RATE_LIMIT: {
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },
};