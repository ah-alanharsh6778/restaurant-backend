const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const createPermissionValidation = [
  body('name').trim().notEmpty().withMessage('Permission name is required'),
  body('action').trim().notEmpty().withMessage('Action is required (e.g. CREATE, READ, UPDATE, DELETE, MANAGE)'),
  body('resource').trim().notEmpty().withMessage('Resource is required (e.g. ORDERS, INVENTORY, USERS)'),
  validate
];

const assignPermissionValidation = [
  body('roleId').notEmpty().withMessage('roleId is required'),
  body('permissionId').notEmpty().withMessage('permissionId is required'),
  validate
];

module.exports = {
  createPermissionValidation,
  assignPermissionValidation
};
