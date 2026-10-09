import type { Express } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import { createNotFoundError } from "./appError.js";
import eventsRouter from '../modules/events/events.routes.js';
import bookingRouter from '../modules/bookings/booking.routes.js';

const routerHandler = (app: Express): void => {
    app.use("/api/auth", authRouter);
    app.use("/api/events", eventsRouter);
    app.use("/api/bookings", bookingRouter);

    app.all("/{*any}", (req, res, next) => {
        next(createNotFoundError(`Route ${req.originalUrl} not found on this server!`));
    });
};

export default routerHandler;