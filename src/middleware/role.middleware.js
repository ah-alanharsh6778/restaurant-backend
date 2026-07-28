const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = typeof req.user.role === 'object' && req.user.role !== null
      ? req.user.role.name
      : req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return next(new ForbiddenError('Forbidden: You do not have permission to access this resource'));
    }

    next();
  };
};

module.exports = authorizeRoles;
