// ===================================================================
// visalinkair Backend - Global Error Handler
// সব error এক জায়গায় handle করার জন্য middleware
// ===================================================================

import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import AppError from '../utils/AppError';

/**
 * প্রতি-field message গুলোকে একটা পড়ার-যোগ্য বাক্যে জোড়া দেয়।
 * message-এ field নামটা আগে থেকেই থাকলে ("Name is required") আর
 * duplicate করি না; না থাকলে "field: message" আকারে দেখাই।
 */
const joinFieldMessages = (errors: { path: string; message: string }[]): string =>
  errors
    .map(({ path, message }) => {
      if (!path) return message;
      const field = path.split('.').pop() as string;
      return message.toLowerCase().includes(field.toLowerCase())
        ? message
        : `${field}: ${message}`;
    })
    .filter(Boolean)
    .join(', ');

/**
 * Handle Zod Validation Errors
 * `message` হয় আসল কারণটাই ("Phone is required"), generic "Validation Error" নয় —
 * কারণ frontend সাধারণত শুধু `message` টাই toast-এ দেখায়।
 */
const handleZodError = (err: ZodError) => {
  const errors = err.issues.map((issue) => ({
    // validateRequest সব কিছু {body, query, params, cookies} দিয়ে wrap করে,
    // তাই path থেকে ওই wrapper অংশটা বাদ দিয়ে আসল field নামটা দেখাই।
    path: issue.path.slice(1).join('.') || issue.path.join('.'),
    message: issue.message,
  }));

  return {
    statusCode: 400,
    message: joinFieldMessages(errors) || 'Validation Error',
    errorMessages: errors,
  };
};

/**
 * Handle Mongoose Cast Error (Invalid ObjectId)
 * যখন ভুল format এর MongoDB ID পাঠানো হয়
 */
const handleCastError = (err: any) => {
  return {
    statusCode: 400,
    message: `Invalid ${err.path}: ${err.value}`,
    errorMessages: [{ path: err.path, message: `Invalid ${err.path}` }],
  };
};

/**
 * Handle Mongoose Duplicate Key Error
 * যখন unique field এ duplicate value দেওয়া হয়
 */
const handleDuplicateError = (err: any) => {
  const field = Object.keys(err.keyValue)[0];
  return {
    statusCode: 400,
    message: `${field} already exists`,
    errorMessages: [{ path: field, message: `${field} already exists` }],
  };
};

/**
 * Handle Mongoose Validation Error
 * Mongoose schema validation fail হলে
 */
const handleValidationError = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => ({
    path: el.path,
    message: el.message,
  }));

  return {
    statusCode: 400,
    message: joinFieldMessages(errors) || 'Validation Error',
    errorMessages: errors,
  };
};

/**
 * Global Error Handler Middleware
 * সব ধরনের error এখানে এসে process হবে এবং client কে response যাবে
 */
const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages: { path: string; message: string }[] = [];

  // ==================== Handle Different Error Types ====================

  // Zod Validation Error (from validateRequest middleware)
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // Custom AppError (thrown intentionally)
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorMessages = [{ path: '', message: err.message }];
  }
  // Mongoose CastError (Invalid ObjectId)
  else if (err.name === 'CastError') {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // Mongoose Duplicate Key Error
  else if (err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // Mongoose Validation Error
  else if (err.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorMessages = simplifiedError.errorMessages;
  }
  // JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
    errorMessages = [{ path: '', message }];
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please login again.';
    errorMessages = [{ path: '', message }];
  }
  // Generic Error
  else if (err instanceof Error) {
    message = err.message;
    errorMessages = [{ path: '', message: err.message }];
  }

  // ==================== Send Error Response ====================
  // Only expose stack traces when NODE_ENV is EXPLICITLY set to 'development'.
  // config.env defaults to 'development' when NODE_ENV is unset, so relying on it
  // would leak internal file paths in production. Check the raw env var instead.
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    // Development mode এ stack trace দেখাবে (NODE_ENV explicitly 'development' হলে)
    stack: isDevelopment ? err.stack : undefined,
  });
};

export default globalErrorHandler;
