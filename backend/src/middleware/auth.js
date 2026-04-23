const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Protect routes — verify JWT and attach req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized — no token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Not authorized — invalid token', 401));
  }
};

/**
 * Authorize by role — restrict access to specific roles
 * Usage: authorize('teacher', 'parent')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`Role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
