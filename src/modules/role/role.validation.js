const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const createRoleValidation = [
  body('name').trim().notEmpty().withMessage('Role name is required'),
  validate
];

const updateRoleValidation = [
  body('name').optional().trim().notEmpty().withMessage('Role name cannot be empty'),
  validate
];

module.exports = {
  createRoleValidation,
  updateRoleValidation
};
