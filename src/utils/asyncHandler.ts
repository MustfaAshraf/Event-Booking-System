import type { RequestHandler } from "express";

export const asyncHandler = (fn: RequestHandler): RequestHandler => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err: unknown) => {
            console.error(
                "API CRASH DETECTED: ",
                err instanceof Error ? err.message : String(err)
            );
            if (err instanceof Error && err.stack) {
                console.error(err.stack);
            }
            next(err);
        });
    };
};