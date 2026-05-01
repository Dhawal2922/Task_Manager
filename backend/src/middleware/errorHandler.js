'use strict';

/**
 * errorHandler — global Express error-handling middleware.
 * Must be mounted LAST with 4 parameters.
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] ${err.stack || err.message}`);

  // Sequelize validation errors → 422
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  // Zod validation errors → 422
  if (err.name === 'ZodError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
};

module.exports = errorHandler;
