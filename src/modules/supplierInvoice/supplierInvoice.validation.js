const { body, validationResult } = require('express-validator');
const { ValidationError } = require('../../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation Failed', errors.array());
  }
  next();
};

const createSupplierInvoiceValidation = [
  body('invoiceNumber').notEmpty().withMessage('invoiceNumber is required'),
  body('supplierId').notEmpty().withMessage('supplierId is required'),
  body('invoiceDate').isISO8601().withMessage('Valid invoiceDate is required'),
  body('subtotal').isFloat({ gt: 0 }).withMessage('subtotal must be a number greater than 0'),
  validate
];

module.exports = {
  createSupplierInvoiceValidation
};
