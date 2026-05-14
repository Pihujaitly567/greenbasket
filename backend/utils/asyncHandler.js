// Wraps async controller functions so we don't need try/catch in every one.
// Any thrown error (including AppError) gets forwarded to the global error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
