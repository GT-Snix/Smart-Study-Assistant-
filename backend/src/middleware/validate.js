const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Middleware factory that validates req.body against a Joi schema.
 * Usage: validate(registerSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new AppError(message, 400));
    }
    next();
  };
};

module.exports = validate;
