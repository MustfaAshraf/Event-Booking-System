import authRouter from "../modules/auth/auth.routes.js";
import eventRouter from "../modules/event/event.routes.js";
import bookingRouter from "../modules/booking/booking.routes.js";

const routerHandler = (app) => {
    app.use("/api/auth", authRouter);
    app.use("/api/events", eventRouter);
    app.use("/api/bookings", bookingRouter);

    app.all("/{*any}", (req, res, next) => {
        next(createNotFoundError(`Route ${req.originalUrl} not found on this server!`));
    });
};

export default routerHandler;