const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const createCustomerValidation = [
  body('fullName').trim().notEmpty().withMessage('fullName is required'),
  body('email').optional().isEmail().withMessage('Valid email required'),
  validate
];

const updateCustomerValidation = [
  body('email').optional().isEmail().withMessage('Valid email required'),
  validate
];

module.exports = {
  createCustomerValidation,
  updateCustomerValidation
};
