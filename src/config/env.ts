import dotenv from 'dotenv';
dotenv.config();

type AppConfig = {
    NODE_ENV: string;
    PORT: number;
    API_PREFIX: string;
    MONGODB_URI: string | undefined;
    JWT: {
        SECRET: string;
        ACCESS_EXPIRE: string;
        REFRESH_EXPIRE: string;
    };
    PAGINATION: {
        DEFAULT_PAGE_SIZE: number;
        MAX_PAGE_SIZE: number;
    };
    RATE_LIMIT: {
        WINDOW_MS: number;
        MAX_REQUESTS: number;
    };
};

export const config: AppConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT ?? '3000', 10),
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
        WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
        MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
    },
};