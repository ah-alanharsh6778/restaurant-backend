const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const processPaymentValidation = [
  body('orderId').notEmpty().withMessage('orderId is required'),
  body('paymentMethod').isIn(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'DUE']).withMessage('Valid paymentMethod is required'),
  body('amountPaid').isFloat({ gt: 0 }).withMessage('amountPaid must be a number greater than 0'),
  validate
];

module.exports = {
  processPaymentValidation
};
