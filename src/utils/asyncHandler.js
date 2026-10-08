export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error("API CRASH DETECTED: ", err.message);
            console.error(err.stack);
            next(err);
        });
    };
};