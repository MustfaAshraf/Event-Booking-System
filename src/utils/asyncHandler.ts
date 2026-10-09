import type { RequestHandler } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

export const asyncHandler = <
    P = ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = Query
>(
    fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
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