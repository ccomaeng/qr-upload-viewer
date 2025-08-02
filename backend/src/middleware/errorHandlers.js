/**
 * Error handling middleware for Express application
 */

// 404 Not Found handler
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

// Global error handler
function errorHandler(err, req, res, next) {
  // Default to 500 server error
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_ERROR';

  // Handle specific error types
  
  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large. Maximum size is 20MB.';
    code = 'FILE_TOO_LARGE';
  } else if (err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Too many files. Only 1 file allowed per upload.';
    code = 'TOO_MANY_FILES';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field. Use "image" field for uploads.';
    code = 'UNEXPECTED_FILE';
  } else if (err.code === 'LIMIT_FIELD_KEY') {
    statusCode = 400;
    message = 'Field name too long.';
    code = 'FIELD_NAME_TOO_LONG';
  } else if (err.code === 'LIMIT_FIELD_VALUE') {
    statusCode = 400;
    message = 'Field value too long.';
    code = 'FIELD_VALUE_TOO_LONG';
  } else if (err.code === 'LIMIT_FIELD_COUNT') {
    statusCode = 400;
    message = 'Too many fields.';
    code = 'TOO_MANY_FIELDS';
  }

  // Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation error: ' + err.details.map(d => d.message).join(', ');
    code = 'VALIDATION_ERROR';
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 409;
    message = 'Database constraint violation';
    code = 'CONSTRAINT_ERROR';
  } else if (err.code && err.code.startsWith('SQLITE_')) {
    statusCode = 500;
    message = 'Database error occurred';
    code = 'DATABASE_ERROR';
  }

  // File system errors
  if (err.code === 'ENOENT') {
    statusCode = 404;
    message = 'File not found';
    code = 'FILE_NOT_FOUND';
  } else if (err.code === 'EACCES') {
    statusCode = 403;
    message = 'File access denied';
    code = 'FILE_ACCESS_DENIED';
  } else if (err.code === 'ENOSPC') {
    statusCode = 507;
    message = 'Insufficient storage space';
    code = 'STORAGE_FULL';
  }

  // Handle specific custom errors
  if (message.includes('Invalid file type')) {
    statusCode = 400;
    code = 'INVALID_FILE_TYPE';
  } else if (message.includes('QR processing failed')) {
    statusCode = 422;
    code = 'QR_PROCESSING_ERROR';
  }

  // Log error details
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    statusCode,
    message,
    code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Log based on severity
  if (statusCode >= 500) {
    console.error('🚨 Server Error:', errorLog);
  } else if (statusCode >= 400) {
    console.warn('⚠️ Client Error:', errorLog);
  }

  // Send error response
  const response = {
    success: false,
    error: message,
    code,
    timestamp: errorLog.timestamp
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(statusCode).json(response);
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Custom error class
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Rate limit error handler
function rateLimitHandler(req, res) {
  const response = {
    success: false,
    error: 'Too many requests from this IP address',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
    retryAfter: req.rateLimit.resetTime
  };

  console.warn('⚠️ Rate limit exceeded:', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    timestamp: response.timestamp
  });

  res.status(429).json(response);
}

// Validation error formatter
function formatValidationError(error) {
  if (error.isJoi) {
    return {
      message: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }))
    };
  }
  return { message: error.message };
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError,
  rateLimitHandler,
  formatValidationError
};