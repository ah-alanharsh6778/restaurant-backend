const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const createStaffValidation = [
  body('userId').notEmpty().withMessage('userId is required'),
  body('employeeCode').notEmpty().withMessage('employeeCode is required'),
  body('department').notEmpty().withMessage('department is required'),
  body('designation').notEmpty().withMessage('designation is required'),
  body('hireDate').isISO8601().withMessage('Valid hireDate is required'),
  validate
];

const updateStaffValidation = [
  body('hireDate').optional().isISO8601().withMessage('Valid hireDate required'),
  validate
];

module.exports = {
  createStaffValidation,
  updateStaffValidation
};
