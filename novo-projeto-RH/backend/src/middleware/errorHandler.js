const { StatusCodes } = require('http-status-codes');

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);

  let error = { ...err };
  error.message = err.message;

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
    }));
    
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  // Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'unknown';
    const value = err.errors[0]?.value || 'unknown';
    
    return res.status(StatusCodes.CONFLICT).json({
      success: false,
      message: `${field} '${value}' already exists`,
      field,
    });
  }

  // Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid reference to related resource',
    });
  }

  // Sequelize database connection errors
  if (err.name === 'SequelizeConnectionError') {
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      success: false,
      message: 'Database connection error',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'File too large',
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Too many files',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Unexpected file field',
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Default server error
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;