const prisma = require('../config/prisma');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const requirePermission = (action, resource) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError('Authentication required'));
      }

      // Admins bypass granular permission checks
      const userRole = typeof req.user.role === 'object' && req.user.role !== null
        ? req.user.role.name
        : req.user.role;

      if (userRole === 'ADMIN') {
        return next();
      }

      const roleId = req.user.roleId || (req.user.role ? req.user.role.id : null);

      if (!roleId) {
        return next(new ForbiddenError('Forbidden: No assigned role permissions'));
      }

      const hasPermission = await prisma.rolePermission.findFirst({
        where: {
          roleId,
          permission: {
            action,
            resource
          }
        }
      });

      if (!hasPermission) {
        return next(new ForbiddenError(`Forbidden: Requires '${action}' permission on '${resource}'`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = requirePermission;
