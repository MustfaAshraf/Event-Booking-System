import express from 'express';
import type { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import routerHandler from './utils/routerHandler.js';
import { globalErrorHandler } from './middlewares/errorHandler.middleware.js';

export const bootstrap = (app: Express): void => {
    app.use(helmet());

    app.use(cors({
        credentials: true
    }));

    app.use(express.json());
    app.use(cookieParser());

    if (config.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    routerHandler(app);

    app.use(globalErrorHandler);
};