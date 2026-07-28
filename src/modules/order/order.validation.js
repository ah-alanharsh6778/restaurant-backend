const { body, validationResult } = require('express-validator');

const createOrderValidation = [
  body('tableId')
    .trim()
    .notEmpty()
    .withMessage('tableId is required'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('items must be an array containing at least one item'),

  body('items.*.menuItemId')
    .trim()
    .notEmpty()
    .withMessage('menuItemId is required for each item'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('quantity is required for each item')
    .isInt({ min: 1 })
    .withMessage('quantity must be an integer of at least 1')
];

const updateOrderValidation = [
  body('status')
    .optional()
    .trim()
    .isIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'])
    .withMessage('status must be one of: PENDING, CONFIRMED, PREPARING, READY, SERVED, COMPLETED, CANCELLED'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('discount must be a positive number'),
  body('taxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('taxAmount must be a positive number')
];

const addOrderItemValidation = [
  body('orderId')
    .trim()
    .notEmpty()
    .withMessage('orderId is required'),

  body('menuItemId')
    .trim()
    .notEmpty()
    .withMessage('menuItemId is required'),

  body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isInt({ min: 1 })
    .withMessage('quantity must be an integer of at least 1')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  createOrderValidation,
  updateOrderValidation,
  addOrderItemValidation,
  validate
};
