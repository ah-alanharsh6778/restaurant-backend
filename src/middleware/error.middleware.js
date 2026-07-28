const { AppError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log non-operational / unexpected errors for internal tracing
  if (!err.isOperational) {
    console.error('UNHANDLED ERROR 💥:', err);
  }

  const responsePayload = {
    success: false,
    message
  };

  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    responsePayload.errors = err.errors;
  }

  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
