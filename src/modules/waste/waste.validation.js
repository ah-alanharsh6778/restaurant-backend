const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const logWasteValidation = [
  body('ingredientId').notEmpty().withMessage('ingredientId is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('quantity must be a number greater than 0'),
  body('reason').isIn(['EXPIRED', 'SPOILED', 'COOKING_ERROR', 'CUSTOMER_RETURN', 'DAMAGE']).withMessage('Valid WasteReason is required'),
  validate
];

module.exports = {
  logWasteValidation
};
