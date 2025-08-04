const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }

  // Custom file type error
  if (err.message === 'Invalid file type. Only CSV and JSON files are allowed.') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry detected',
          error: process.env.NODE_ENV === 'development' ? err.detail : undefined
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          message: 'Referenced record does not exist'
        });
      case '23502': // Not null violation
        return res.status(400).json({
          success: false,
          message: 'Required field is missing'
        });
      default:
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error occurred'
        });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};